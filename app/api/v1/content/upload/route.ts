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
                // Map CSV fields to DB columns (adjust as needed)
                const mapped = {
                    post_id: postId,
                    account_id: row['Account ID'],
                    account_username: row['Account username'],
                    account_name: row['Account name'],
                    description: row['Description'],
                    duration_sec: Number(row['Duration (sec)']) || 0,
                    publish_time: row['Publish time'] ? new Date(row['Publish time']) : null,
                    permalink: row['Permalink'],
                    post_type: row['Post type'],
                    data_comment: row['Data comment'],
                    date_field: row['Date'],
                    views: Number(row['Views']) || 0,
                    reach: Number(row['Reach']) || 0,
                    likes: Number(row['Likes']) || 0,
                    shares: Number(row['Shares']) || 0,
                    follows: Number(row['Follows']) || 0,
                    comments: Number(row['Comments']) || 0,
                    saves: Number(row['Saves']) || 0,
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
