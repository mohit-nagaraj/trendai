import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { processInstagramCsv } from '@/lib/ingest/instagram';
import { processTiktokCsv } from '@/lib/ingest/tiktok';
import { analysisQueue } from '@/lib/queue/analysis-queue';
import { generateAnalyticsCards } from '@/lib/analytics/cards-generator';

const BUCKET = 'final-round-ai-files';
const FOLDER = 'uploads';

// Extracted analysis queue logic for reuse
async function queueAnalysisJobs(contentIds: string[], priority = 1) {
    const supabase = await createClient();
    // Validate content posts exist and are not already processed
    const { data: contentPosts, error } = await supabase
        .from('content_posts')
        .select('id, processing_status, ai_analysis_complete, post_link')
        .in('id', contentIds);
    if (error) {
        throw new Error(`Failed to fetch content posts: ${error.message}`);
    }
    const validPosts = contentPosts?.filter(
        post => !post.ai_analysis_complete && post.processing_status !== 'processing'
    ) || [];
    if (validPosts.length === 0) {
        return { message: 'No valid posts to analyze', validPosts: 0 };
    }
    // Separate posts with and without media
    const postsWithMedia = validPosts.filter(post => post.post_link);
    const postsWithoutMedia = validPosts.filter(post => !post.post_link);
    // Add jobs to queue (higher priority for posts with media)
    const jobIds = [
        ...postsWithMedia.map(post => analysisQueue.addJob(post.id, priority + 1)),
        ...postsWithoutMedia.map(post => analysisQueue.addJob(post.id, priority)),
    ];
    // Update status to queued
    await supabase
        .from('content_posts')
        .update({ processing_status: 'pending' })
        .in('id', validPosts.map(p => p.id));
    return {
        message: 'Analysis jobs queued successfully',
        jobIds,
        totalJobs: jobIds.length,
        postsWithMedia: postsWithMedia.length,
        postsWithoutMedia: postsWithoutMedia.length,
        queueStatus: analysisQueue.getQueueStatus(),
    };
}

export async function POST(req: Request) {
    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file');
    const source = formData.get('source');

    // Check if file is present
    if (!file) {
        return NextResponse.json({ error: 'No CSV file provided' }, { status: 400 });
    }
    if (!source || (typeof source === 'string' && !['instagram', 'tiktok'].includes(source))) {
        return NextResponse.json({ error: 'Invalid or missing source' }, { status: 400 });
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
        try {
            console.log(`[PROCESSING START] processId=${processId}, uploadPath=${uploadPath}`);
            // Download the uploaded CSV from Supabase Storage
            const supabaseBg = await createClient();
            const { data: fileData, error: downloadError } = await supabaseBg.storage.from(BUCKET).download(uploadPath);
            if (downloadError || !fileData) throw new Error(downloadError?.message || 'Failed to download CSV');
            const arrayBuffer = await fileData.arrayBuffer();
            const csvString = Buffer.from(arrayBuffer).toString('utf-8');
            let stats;
            if (source === 'instagram') {
                stats = await processInstagramCsv(csvString, processId);
            } else if (source === 'tiktok') {
                stats = await processTiktokCsv(csvString, processId);
            }
            console.log(`[PROCESSING COMPLETE] processId=${processId} -`, stats);
            
            // Generate analytics cards if we have processed posts
            if (stats && stats.processedIds && stats.processedIds.length > 0) {
                try {
                    console.log(`[ANALYTICS START] processId=${processId} - Generating cards for ${stats.processedIds.length} posts`);
                    const analyticsCards = await generateAnalyticsCards();
                    console.log(`[ANALYTICS COMPLETE] processId=${processId} -`, analyticsCards);
                    
                    // Store analytics in cache table for frontend retrieval
                    const analyticsData = {
                        cards_data: analyticsCards,
                        generated_at: new Date().toISOString(),
                        post_count: stats.processedIds.length,
                        source: source as string
                    };
                    
                    // Store in analytics_cache table
                    const { error: analyticsError } = await supabaseBg
                        .from('analytics_cache')
                        .insert([analyticsData]);
                    
                    if (analyticsError) {
                        console.warn(`[ANALYTICS CACHE WARNING] processId=${processId} -`, analyticsError.message);
                    }
                    
                } catch (analyticsErr) {
                    console.error(`[ANALYTICS ERROR] processId=${processId} -`, analyticsErr);
                }
                
                    try {
                        const result = await queueAnalysisJobs(stats.processedIds);
                        console.log(`[ANALYSIS QUEUE] processId=${processId} -`, result);
                    } catch (analyzeErr) {
                        console.error(`[ANALYSIS QUEUE ERROR] processId=${processId} -`, analyzeErr);
                    }

            }
        } catch (err) {
            console.error(`[PROCESSING FAILED] processId=${processId} -`, err);
        }
    }, 0);

    // Respond to frontend with process info (totalRecords is null since we don't parse CSV here)
    return NextResponse.json({
        message: 'CSV uploaded and processing queued',
        processId,
        totalRecords: null,
        status: 'processing_queued'
    }, { status: 200 });
}
