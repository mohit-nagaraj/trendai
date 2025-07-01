import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { parseCsvToObjects } from '@/utils/csv';

const BUCKET = 'final-round-ai-files';
const FOLDER = 'uploads';

export async function POST(req: Request) {
    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file');

    // Check if file is present
    if (!file) {
        return NextResponse.json({ error: 'No CSV file provided' }, { status: 400 });
    }

    // Validate file type and extension
    const fileName = (file as File).name || '';
    const fileType = (file as File).type || '';
    if (!fileName.endsWith('.csv')) {
        return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 });
    }
    if (fileType && fileType !== 'text/csv' && fileType !== 'application/vnd.ms-excel') {
        return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 });
    }

    // Read file as buffer
    const arrayBuffer = await (file as File).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Prepare Supabase client (server-side) using your util
    const supabase = await createClient();

    // Upload to Supabase Storage
    const uploadPath = `${FOLDER}/${Date.now()}-${fileName.replace(/\s+/g, '_')}`;
    const { error } = await supabase.storage.from(BUCKET).upload(uploadPath, buffer, {
        contentType: 'text/csv',
        upsert: false,
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Generate a processId for tracking (could be used for logs, etc.)
    const processId = `process_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    // Start async processing pipeline
    setTimeout(async () => {
        let processed = 0;
        let failed = 0;
        let skipped = 0;
        try {
            console.log(`[PROCESSING START] processId=${processId}, uploadPath=${uploadPath}`);
            // Download the uploaded CSV from Supabase Storage
            const supabaseBg = await createClient();
            const { data: fileData, error: downloadError } = await supabaseBg.storage.from(BUCKET).download(uploadPath);
            if (downloadError || !fileData) throw new Error(downloadError?.message || 'Failed to download CSV');
            const arrayBuffer = await fileData.arrayBuffer();
            const csvString = Buffer.from(arrayBuffer).toString('utf-8');
            // Parse CSV
            const rows = parseCsvToObjects(csvString);
            for (const row of rows) {
                const postId = row['Post ID'];
                if (!postId) {
                    console.warn(`[SKIP ROW] processId=${processId} - Missing Post ID, row:`, row);
                    skipped++;
                    continue;
                }
                // Calculate metrics
                const likes = Number(row['Likes']) || 0;
                const comments = Number(row['Comments']) || 0;
                const shares = Number(row['Shares']) || 0;
                const saves = Number(row['Saves']) || 0;
                const reach = Number(row['Reach']) || 0;

                const engagement_rate = reach > 0 ? ((likes + comments + shares + saves) / reach) * 100 : 0;
                const viral_coefficient = reach > 0 ? shares / reach : 0;
                const performance_score = 0.4 * engagement_rate + 0.6 * viral_coefficient * 100; // Example formula

                // trigger call to basically scrape and upload the file
                const permapostlink = row['Permalink'];
                // call the instagram graph api to get the post data
                // get the link
                // add the link to the below mapped object for field "post_link"

                // --- Instagram Media Download & Supabase Upload ---
                let post_link = null;
                try {
                    // 1. Get Instagram Access Token
                    const accessToken = process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN;
                    if (!accessToken) throw new Error('Instagram access token not set in env');

                    // 2. Fetch media_url from Instagram Graph API
                    // Prefer Post ID if available, else try to extract from Permalink
                    let igPostId = postId;
                    if (!igPostId && permapostlink) {
                        // Try to extract numeric ID from permalink (if needed)
                        const match = permapostlink.match(/([0-9]{10,})/);
                        if (match) igPostId = match[1];
                    }
                    if (igPostId) {
                        const igApiUrl = `https://graph.instagram.com/${igPostId}?fields=media_url,media_type&access_token=${accessToken}`;
                        const igRes = await fetch(igApiUrl);
                        if (!igRes.ok) throw new Error(`Instagram API error: ${igRes.status}`);
                        const igData = await igRes.json();
                        if (igData.media_url) {
                            // 3. Download the media file
                            const mediaRes = await fetch(igData.media_url);
                            if (!mediaRes.ok) throw new Error(`Failed to download media: ${mediaRes.status}`);
                            const mediaBuffer = Buffer.from(await mediaRes.arrayBuffer());
                            // 4. Determine file extension
                            let ext = 'jpg';
                            if (igData.media_type === 'VIDEO') ext = 'mp4';
                            else if (igData.media_type === 'CAROUSEL_ALBUM' || igData.media_type === 'IMAGE') {
                                // Try to infer from content-type
                                const contentType = mediaRes.headers.get('content-type') || '';
                                if (contentType.includes('png')) ext = 'png';
                                else if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg';
                            }
                            // 5. Upload to Supabase Storage
                            const mediaFileName = `videos/${igPostId}.${ext}`;
                            const { error: uploadErr } = await supabaseBg.storage.from(BUCKET).upload(mediaFileName, mediaBuffer, {
                                contentType: mediaRes.headers.get('content-type') || undefined,
                                upsert: true,
                            });
                            if (uploadErr && uploadErr.message && !uploadErr.message.includes('The resource already exists')) {
                                throw new Error(`Supabase upload error: ${uploadErr.message}`);
                            }
                            // 6. Get public URL
                            const { data: publicUrlData } = supabaseBg.storage.from(BUCKET).getPublicUrl(mediaFileName);
                            post_link = publicUrlData?.publicUrl || null;
                        }
                    }
                } catch (mediaErr) {
                    console.error(`[MEDIA ERROR] processId=${processId} - post_id=${postId} -`, mediaErr);
                }
                // --- END Instagram Media Download & Supabase Upload ---

                // Map CSV fields to DB columns (adjust as needed)
                const mapped = {
                    post_id: postId,
                    account_id: row['Account ID'],
                    account_username: row['Account username'],
                    account_name: row['Account name'],
                    description: row['Description'],
                    duration_sec: Number(row['Duration (sec)']) || 0,
                    publish_time: row['Publish time'] ? new Date(row['Publish time']) : null,
                    permalink: permapostlink,
                    post_type: row['Post type'],
                    data_comment: 'Imported for Q2 Analysis', // Hardcoded
                    date_field: row['Date'],
                    views: Number(row['Views']) || 0,
                    reach,
                    likes,
                    shares,
                    follows: Number(row['Follows']) || 0,
                    comments,
                    saves,
                    // New calculated fields
                    engagement_rate: Number(engagement_rate.toFixed(2)),
                    viral_coefficient: Number(viral_coefficient.toFixed(2)),
                    performance_score: Number(performance_score.toFixed(2)),
                    post_link, // Add the Supabase public URL here
                };
                try {
                    console.log(`[DB INSERT] processId=${processId} - Inserting post_id=${postId}`);
                    const { error: upsertError } = await supabaseBg.from('content_posts').upsert([mapped], { onConflict: 'post_id' });
                    if (upsertError) {
                        console.error(`[DB ERROR] processId=${processId} - post_id=${postId} -`, upsertError.message);
                        failed++;
                    } else {
                        console.log(`[DB SUCCESS] processId=${processId} - post_id=${postId}`);
                        processed++;
                    }
                } catch (rowErr) {
                    console.error(`[ROW ERROR] processId=${processId} - post_id=${postId} -`, rowErr);
                    failed++;
                }
            }
            console.log(`[PROCESSING COMPLETE] processId=${processId} - Processed: ${processed}, Failed: ${failed}, Skipped: ${skipped}`);
        } catch (err) {
            console.error(`[PROCESSING FAILED] processId=${processId} -`, err);
        }
    }, 0);

    // Respond to frontend with process info (totalRecords is null since we don't parse CSV here)
    return NextResponse.json({
        message: 'CSV uploaded and processing queued',
        processId,
        totalRecords: null, // TODO: Parse CSV in request if you want to return this
        status: 'processing_queued'
    }, { status: 200 });
}
