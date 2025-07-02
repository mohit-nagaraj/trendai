import { createClient } from '@/utils/supabase/server';
import { parseCsvToObjects } from '@/utils/csv';

const BUCKET = 'final-round-ai-files';

type TikwmApiResponse = {
  code: number;
  data?: {
    id?: string;
    play?: string;
    duration?: number;
    download_count?: number;
    author?: {
      id?: string;
      nickname?: string;
    };
  };
};

export async function processTiktokCsv(csvString: string, processId: string) {
  const supabaseBg = await createClient();
  const rows = parseCsvToObjects(csvString);
  let processed = 0;
  let failed = 0;
  let skipped = 0;
  const processedIds: string[] = [];
  for (const row of rows) {
    const videoLink = row['Video link'];
    if (!videoLink) {
      skipped++;
      continue;
    }
    // Calculate metrics
    const likes = Number(row['Total likes']) || 0;
    const comments = Number(row['Total comments']) || 0;
    const shares = Number(row['Total shares']) || 0;
    const views = Number(row['Total views']) || 0;
    const engagement_rate = views > 0 ? ((likes + comments + shares) / views) * 100 : 0;
    const viral_coefficient = views > 0 ? shares / views : 0;
    const performance_score = 0.4 * engagement_rate + 0.6 * viral_coefficient * 100;
    // Extract account_username from videoLink
    let account_username = null;
    const match = videoLink.match(/tiktok\.com\/@([^\/]+)/);
    if (match) {
      account_username = match[1];
    }
    // --- TikTok Video Download & Supabase Upload ---
    let post_link = null;
    let apiData: TikwmApiResponse = { code: -1 };
    try {
      // 1. Call 3rd party API to get downloadable video URL
      const response = await fetch('https://www.tikwm.com/api/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `url=${encodeURIComponent(videoLink)}`
      });
      apiData = await response.json();
      if (apiData.code === 0 && apiData.data && apiData.data.play) {
        const videoUrl = apiData.data.play;
        // 2. Download the video
        const videoRes = await fetch(videoUrl);
        if (!videoRes.ok) throw new Error(`Failed to download TikTok video: ${videoRes.status}`);
        const videoBuffer = Buffer.from(await videoRes.arrayBuffer());
        // 3. Upload to Supabase Storage
        const tiktokId = apiData.data.id || Math.random().toString(36).slice(2, 11);
        const mediaFileName = `videos/tiktok_${tiktokId}.mp4`;
        const { error: uploadErr } = await supabaseBg.storage.from(BUCKET).upload(mediaFileName, videoBuffer, {
          contentType: videoRes.headers.get('content-type') || 'video/mp4',
          upsert: true,
        });
        if (uploadErr && uploadErr.message && !uploadErr.message.includes('The resource already exists')) {
          throw new Error(`Supabase upload error: ${uploadErr.message}`);
        }
        const { data: publicUrlData } = supabaseBg.storage.from(BUCKET).getPublicUrl(mediaFileName);
        post_link = publicUrlData?.publicUrl || null;
      }
    } catch (mediaErr) {
      console.error(`[TIKTOK MEDIA ERROR] processId=${processId} - videoLink=${videoLink} -`, mediaErr);
    }
    // --- END TikTok Video Download & Supabase Upload ---
    // Extract account_id and account_name from apiData
    let account_id = null;
    let account_name = null;
    if (apiData.data && apiData.data.author) {
      account_id = apiData.data.author.id || null;
      account_name = apiData.data.author.nickname || null;
    }
    const mapped = {
      post_id: apiData.data?.id || null,
      account_id,
      account_username,
      account_name,
      description: row['Video title'] || null,
      duration_sec: apiData.data?.duration || null,
      publish_time: row['Post time'] ? new Date(row['Post time']) : null,
      permalink: videoLink,
      post_type: 'tiktok',
      data_comment: 'Imported for Q2 Analysis',
      date_field: row['Time'] || null,
      views,
      reach: views,
      likes,
      shares,
      follows: null,
      comments,
      saves: apiData.data?.download_count || null,
      engagement_rate: Number(engagement_rate.toFixed(2)),
      viral_coefficient: Number(viral_coefficient.toFixed(2)),
      performance_score: Number(performance_score.toFixed(2)),
      post_link,
      platform: 'tiktok',
    };
    try {
      const { error: upsertError } = await supabaseBg.from('content_posts').upsert([mapped], { onConflict: 'post_id' });
      if (upsertError) {
        console.error(`[TIKTOK DB ERROR] processId=${processId} - videoLink=${videoLink} -`, upsertError.message);
        failed++;
      } else {
        processed++;
        // Query for the row to get its id
        const { data: found, error: findError } = await supabaseBg
          .from('content_posts')
          .select('id')
          .eq('post_id', mapped.post_id)
          .maybeSingle();
        if (!findError && found && found.id) {
          processedIds.push(found.id);
        }
      }
    } catch (rowErr) {
      console.error(`[TIKTOK ROW ERROR] processId=${processId} - videoLink=${videoLink} -`, rowErr);
      failed++;
    }
  }
  return { processed, failed, skipped, processedIds };
} 