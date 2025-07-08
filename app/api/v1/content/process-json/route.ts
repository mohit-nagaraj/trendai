import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { analysisQueue } from '@/lib/queue/analysis-queue';
import { generateAnalyticsCards } from '@/lib/analytics/cards-generator';

const BUCKET = 'final-round-ai-files';

// Extracted analysis queue logic for reuse (from upload/route.ts)
async function queueAnalysisJobs(contentIds: string[], priority = 1) {
    const supabase = await createClient();
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
    const postsWithMedia = validPosts.filter(post => post.post_link);
    const postsWithoutMedia = validPosts.filter(post => !post.post_link);
    const jobIds = [
        ...postsWithMedia.map(post => analysisQueue.addJob(post.id, priority + 1)),
        ...postsWithoutMedia.map(post => analysisQueue.addJob(post.id, priority)),
    ];
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
  try {
    const body = await req.json();
    console.log('[PROCESS-JSON] Incoming request body:', JSON.stringify(body, null, 2));
    const { posts, source } = body;
    if (!Array.isArray(posts) || !source) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
    const processId = `process_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
    // Start async processing pipeline
    setTimeout(async () => {
      const supabase = await createClient();
      let processed = 0;
      let failed = 0;
      let skipped = 0;
      const processedIds: string[] = [];
      for (const post of posts) {
        try {
          let videoUrl = '';
          let postId = post.id || post.aweme_id || post.video_id || post.shortCode;
          let mapped: any = {};
          if (source === 'instagram') {
            videoUrl = post.videoUrl;
            // Calculate analytics
            const likes = post.likesCount || 0;
            const comments = post.commentsCount || 0;
            const shares = 0;
            const saves = 0;
            const reach = post.videoViewCount || 0;
            const views = post.videoPlayCount || 0;
            const follows = 0;
            const engagement_rate = views > 0 ? ((likes + comments + shares + saves) / views) * 100 : 0;
            const viral_coefficient = views > 0 ? shares / views : 0;
            const performance_score = 0.4 * engagement_rate + 0.6 * viral_coefficient * 100;
            // Download and upload video
            let post_link = null;
            if (videoUrl) {
              const videoRes = await fetch(videoUrl);
              if (!videoRes.ok) throw new Error(`Failed to download video: ${videoRes.status}`);
              const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
              const mediaFileName = `videos/instagram_${postId}.mp4`;
              const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(mediaFileName, videoBuffer, {
                contentType: videoRes.headers.get('content-type') || 'video/mp4',
                upsert: true,
              });
              if (uploadErr && uploadErr.message && !uploadErr.message.includes('The resource already exists')) {
                throw new Error(`Supabase upload error: ${uploadErr.message}`);
              }
              const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(mediaFileName);
              post_link = publicUrlData?.publicUrl || null;
            }
            mapped = {
              post_id: postId,
              account_id: post.ownerId,
              account_username: post.ownerUsername,
              account_name: post.ownerFullName,
              description: post.caption,
              duration_sec: post.videoDuration ? Math.floor(post.videoDuration) : 0,
              publish_time: post.timestamp ? new Date(post.timestamp) : null,
              permalink: post.url,
              post_type: post.productType || 'reel',
              data_comment: 'Imported via JSON',
              date_field: 'Lifetime',
              views,
              reach,
              likes,
              shares,
              follows,
              comments,
              saves,
              engagement_rate: Number(engagement_rate.toFixed(2)),
              viral_coefficient: Number(viral_coefficient.toFixed(2)),
              performance_score: Number(performance_score.toFixed(2)),
              post_link,
              platform: 'instagram',
              processing_status: 'pending',
              ai_analysis_complete: false,
            };
          } else if (source === 'tiktok') {
            // New TikTok actor mapping
            videoUrl = post.mediaUrls?.[0] || post.videoMeta?.downloadAddr || post.webVideoUrl || '';
            const author = post.authorMeta || {};
            const videoMeta = post.videoMeta || {};
            const likes = post.diggCount || 0;
            const comments = post.commentCount || 0;
            const shares = post.shareCount || 0;
            const views = post.playCount || 0;
            const saves = post.collectCount || 0;
            const engagement_rate = views > 0 ? ((likes + comments + shares + saves) / views) * 100 : 0;
            const viral_coefficient = views > 0 ? shares / views : 0;
            const performance_score = 0.4 * engagement_rate + 0.6 * viral_coefficient * 100;
            // Download and upload video
            let post_link = null;
            if (videoUrl) {
              const videoRes = await fetch(videoUrl);
              if (!videoRes.ok) throw new Error(`Failed to download video: ${videoRes.status}`);
              const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
              const mediaFileName = `videos/tiktok_${postId}.mp4`;
              const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(mediaFileName, videoBuffer, {
                contentType: videoRes.headers.get('content-type') || 'video/mp4',
                upsert: true,
              });
              if (uploadErr && uploadErr.message && !uploadErr.message.includes('The resource already exists')) {
                throw new Error(`Supabase upload error: ${uploadErr.message}`);
              }
              const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(mediaFileName);
              post_link = publicUrlData?.publicUrl || null;
            }
            mapped = {
              post_id: post.id,
              account_id: author.id,
              account_username: author.name,
              account_name: author.nickName,
              description: post.text,
              duration_sec: videoMeta.duration ? Math.floor(videoMeta.duration) : 0,
              publish_time: post.createTimeISO ? new Date(post.createTimeISO) : null,
              permalink: post.webVideoUrl || '',
              post_type: post.type || 'tiktok',
              data_comment: 'Imported via JSON',
              date_field: 'Lifetime',
              views,
              reach: views,
              likes,
              shares,
              follows: author.fans || 0,
              comments,
              saves,
              engagement_rate: Number(engagement_rate.toFixed(2)),
              viral_coefficient: Number(viral_coefficient.toFixed(2)),
              performance_score: Number(performance_score.toFixed(2)),
              post_link,
              platform: 'tiktok',
              processing_status: 'pending',
              ai_analysis_complete: false,
            };
            // Debug: log mapped TikTok object
            console.log('[PROCESS-JSON] TikTok mapped object:', JSON.stringify(mapped, null, 2));
          } else {
            skipped++;
            continue;
          }
          // Debug: log string field lengths
          Object.entries(mapped).forEach(([key, value]) => {
            if (typeof value === 'string') {
              console.log(`[FIELD LENGTH] ${key}: ${value.length} value:`, value);
            }
          });
          const { error: upsertError } = await supabase.from('content_posts').upsert([mapped], { onConflict: 'post_id' });
          if (upsertError) {
            console.error(`[DB ERROR] processId=${processId} - post_id=${postId} -`, upsertError.message);
            failed++;
          } else {
            processed++;
            // Query for the row to get its id
            const { data: found, error: findError } = await supabase
              .from('content_posts')
              .select('id')
              .eq('post_id', postId)
              .maybeSingle();
            if (!findError && found && found.id) {
              processedIds.push(found.id);
            }
          }
        } catch (err) {
          console.error(`[PROCESS-JSON ERROR] processId=${processId} -`, err);
          failed++;
        }
      }
      // Trigger analytics and analysis if any posts processed
      if (processedIds.length > 0) {
        try {
          const analyticsCards = await generateAnalyticsCards();
          const analyticsData = {
            cards_data: analyticsCards,
            generated_at: new Date().toISOString(),
            post_count: processedIds.length,
            source: source as string
          };
          await supabase.from('analytics_cache').insert([analyticsData]);
        } catch (analyticsErr) {
          console.error(`[ANALYTICS ERROR] processId=${processId} -`, analyticsErr);
        }
        try {
          await queueAnalysisJobs(processedIds);
        } catch (analyzeErr) {
          console.error(`[ANALYSIS QUEUE ERROR] processId=${processId} -`, analyzeErr);
        }
      }
      // Optionally: log or store process stats somewhere
    }, 0);
    // Respond immediately
    return NextResponse.json({
      message: 'Processing queued',
      processId,
      status: 'processing_queued'
    }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to process posts' }, { status: 500 });
  }
} 