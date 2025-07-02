import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { analysisQueue } from '@/lib/queue/analysis-queue';

export async function POST(req: Request) {
  try {
    const { contentIds, priority = 1 } = await req.json();
    if (!contentIds || !Array.isArray(contentIds)) {
      return NextResponse.json({ error: 'contentIds array is required' }, { status: 400 });
    }
    const supabase = await createClient();
    // Validate content posts exist and are not already processed
    const { data: contentPosts, error } = await supabase
      .from('content_posts')
      .select('id, processing_status, ai_analysis_complete, post_link')
      .in('id', contentIds);
    if (error) {
      return NextResponse.json({ error: 'Failed to fetch content posts' }, { status: 500 });
    }
    const validPosts = contentPosts?.filter(
      post => !post.ai_analysis_complete && post.processing_status !== 'processing'
    ) || [];
    // Separate posts with and without media
    const postsWithMedia = validPosts.filter(post => post.post_link);
    const postsWithoutMedia = validPosts.filter(post => !post.post_link);
    if (validPosts.length === 0) {
      return NextResponse.json({ message: 'No valid posts to analyze', validPosts: 0 }, { status: 200 });
    }
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
    return NextResponse.json({
      message: 'Analysis jobs queued successfully',
      jobIds,
      totalJobs: jobIds.length,
      postsWithMedia: postsWithMedia.length,
      postsWithoutMedia: postsWithoutMedia.length,
      queueStatus: analysisQueue.getQueueStatus(),
    });
  } catch (error) {
    console.error('Error queuing analysis jobs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 