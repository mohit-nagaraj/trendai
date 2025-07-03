import { createClient } from '@/utils/supabase/server';
import { parseCsvToObjects } from '@/utils/csv';

const BUCKET = 'final-round-ai-files';

// Utility to parse numbers with commas
export function parseNumberWithCommas(val: string | number | undefined | null): number {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  return Number(String(val).replace(/,/g, '')) || 0;
}

export async function processInstagramCsv(csvString: string, processId: string) {
  const supabaseBg = await createClient();
  const rows = parseCsvToObjects(csvString);
  let processed = 0;
  let failed = 0;
  let skipped = 0;
  const processedIds: string[] = [];
  for (const row of rows) {
    const postId = row['Post ID'];
    if (!postId) {
      console.warn(`[SKIP ROW] processId=${processId} - Missing Post ID, row:`, row);
      skipped++;
      continue;
    }
    // Calculate metrics
    const likes = parseNumberWithCommas(row['Likes']);
    const comments = parseNumberWithCommas(row['Comments']);
    const shares = parseNumberWithCommas(row['Shares']);
    const saves = parseNumberWithCommas(row['Saves']);
    const reach = parseNumberWithCommas(row['Reach']);
    const views = parseNumberWithCommas(row['Views']);
    const follows = parseNumberWithCommas(row['Follows']);
    const engagement_rate = reach > 0 ? ((likes + comments + shares + saves) / reach) * 100 : 0;
    const viral_coefficient = reach > 0 ? shares / reach : 0;
    const performance_score = 0.4 * engagement_rate + 0.6 * viral_coefficient * 100;
    const permapostlink = row['Permalink'];
    // --- Instagram Media Download & Supabase Upload ---
    let post_link = null;
    try {
      const accessToken = process.env.NEXT_PUBLIC_INSTAGRAM_ACCESS_TOKEN;
      if (!accessToken) throw new Error('Instagram access token not set in env');
      let igPostId = postId;
      if (!igPostId && permapostlink) {
        const match = permapostlink.match(/([0-9]{10,})/);
        if (match) igPostId = match[1];
      }
      if (igPostId) {
        const igApiUrl = `https://graph.instagram.com/${igPostId}?fields=media_url,media_type&access_token=${accessToken}`;
        const igRes = await fetch(igApiUrl);
        if (!igRes.ok) throw new Error(`Instagram API error: ${igRes.status}`);
        const igData = await igRes.json();
        if (igData.media_url) {
          const mediaRes = await fetch(igData.media_url);
          if (!mediaRes.ok) throw new Error(`Failed to download media: ${mediaRes.status}`);
          const mediaBuffer = Buffer.from(await mediaRes.arrayBuffer());
          let ext = 'jpg';
          if (igData.media_type === 'VIDEO') ext = 'mp4';
          else if (igData.media_type === 'CAROUSEL_ALBUM' || igData.media_type === 'IMAGE') {
            const contentType = mediaRes.headers.get('content-type') || '';
            if (contentType.includes('png')) ext = 'png';
            else if (contentType.includes('jpeg') || contentType.includes('jpg')) ext = 'jpg';
          }
          const mediaFileName = `videos/instagram_${igPostId}.${ext}`;
          const { error: uploadErr } = await supabaseBg.storage.from(BUCKET).upload(mediaFileName, mediaBuffer, {
            contentType: mediaRes.headers.get('content-type') || undefined,
            upsert: true,
          });
          if (uploadErr && uploadErr.message && !uploadErr.message.includes('The resource already exists')) {
            throw new Error(`Supabase upload error: ${uploadErr.message}`);
          }
          const { data: publicUrlData } = supabaseBg.storage.from(BUCKET).getPublicUrl(mediaFileName);
          post_link = publicUrlData?.publicUrl || null;
        }
      }
    } catch (mediaErr) {
      console.error(`[MEDIA ERROR] processId=${processId} - post_id=${postId} -`, mediaErr);
    }
    // --- END Instagram Media Download & Supabase Upload ---
    const mapped = {
      post_id: postId,
      account_id: row['Account ID'],
      account_username: row['Account username'],
      account_name: row['Account name'],
      description: row['Description'],
      duration_sec: parseNumberWithCommas(row['Duration (sec)']),
      publish_time: row['Publish time'] ? new Date(row['Publish time']) : null,
      permalink: permapostlink,
      post_type: row['Post type'],
      data_comment: 'Imported for Q2 Analysis',
      date_field: row['Date'],
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
    };
    try {
      const { error: upsertError } = await supabaseBg.from('content_posts').upsert([mapped], { onConflict: 'post_id' });
      if (upsertError) {
        console.error(`[DB ERROR] processId=${processId} - post_id=${postId} -`, upsertError.message);
        failed++;
      } else {
        processed++;
        // Query for the row to get its id
        const { data: found, error: findError } = await supabaseBg
          .from('content_posts')
          .select('id')
          .eq('post_id', postId)
          .maybeSingle();
        if (!findError && found && found.id) {
          processedIds.push(found.id);
        }
      }
    } catch (rowErr) {
      console.error(`[ROW ERROR] processId=${processId} - post_id=${postId} -`, rowErr);
      failed++;
    }
  }
  return { processed, failed, skipped, processedIds };
} 