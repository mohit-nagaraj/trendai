import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { analysisQueue } from '@/lib/queue/analysis-queue';

export async function GET(req: Request) {
  try {
    const supabase = await createClient();
    // Get processing status counts
    const { data: statusCounts } = await supabase
      .from('content_posts')
      .select('processing_status, post_link')
      .not('processing_status', 'is', null);
    const counts = statusCounts?.reduce((acc, post) => {
      acc[post.processing_status] = (acc[post.processing_status] || 0) + 1;
      if (post.post_link) {
        acc.withMedia = (acc.withMedia || 0) + 1;
      } else {
        acc.withoutMedia = (acc.withoutMedia || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};
    // Get recent analysis results with visual analysis
    const { data: recentAnalysis } = await supabase
      .from('content_analysis')
      .select(`
        id,
        content_id,
        performance_category,
        visual_hook_strength,
        visual_appeal_score,
        brand_consistency_score,
        has_visual_analysis,
        processing_time_ms,
        gemini_model_used,
        created_at
      `)
      .order('created_at', { ascending: false })
      .limit(10);
    return NextResponse.json({
      queueStatus: analysisQueue.getQueueStatus(),
      processingCounts: counts,
      recentAnalysis: recentAnalysis || [],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting analysis status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 