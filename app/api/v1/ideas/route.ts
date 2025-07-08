// app/api/v1/ideas/generate/route.ts
import { NextResponse } from 'next/server';
import { getContentInspirationFromTrends } from '@/lib/ai/gemini-service';
import { createServiceClient } from '@/utils/supabase/service';

interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: string;
  duration: string;
  url: string;
  embedUrl: string;
}

interface EnhancedInspiration {
  title: string;
  original_title: string;
  source: string;
  sources: string[];
  final_score: number;
  description: string;
  keywords: string[];
  relevance_score: number;
  content_angles: string[];
}

async function getYouTubeVideos(query: string, maxResults: number = 5): Promise<YouTubeVideo[]> {
  const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_KEY;
  
  if (!API_KEY) {
    console.error('YouTube API key not found');
    return [];
  }

  try {
    // Search for relevant videos (not restricted to shorts)
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
      `part=snippet&` +
      `q=${encodeURIComponent(query)}&` +
      `type=video&` +
      `order=relevance&` +
      `maxResults=${maxResults}&` +
      `key=${API_KEY}`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.items || searchData.items.length === 0) {
      return [];
    }

    // Get video IDs for additional details
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');
    
    // Get additional video statistics and content details
    const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?` +
      `part=statistics,contentDetails&` +
      `id=${videoIds}&` +
      `key=${API_KEY}`;

    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();

    // Combine search results with video details
    const videos: YouTubeVideo[] = searchData.items.map((item: any, index: number) => {
      const details = detailsData.items?.[index];
      
      return {
        id: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnail: item.snippet.thumbnails.high?.url || item.snippet.thumbnails.default.url,
        publishedAt: item.snippet.publishedAt,
        viewCount: details?.statistics?.viewCount || '0',
        duration: details?.contentDetails?.duration || 'PT0S',
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`
      };
    });

    return videos;
  } catch (error) {
    console.error('YouTube API error:', error);
    return [];
  }
}

async function enhanceWithYouTubeVideos(inspirations: any[]): Promise<any[]> {
  const enhanced: any[] = [];

  for (const inspiration of inspirations) {
    try {
      // Create single search query using first 4 keywords
      const firstFourKeywords = inspiration.keywords.slice(0, 4).join(' ');
      const searchQuery = `${firstFourKeywords}  interview career tips`;
      
      console.log(`[YouTube] Searching for: "${searchQuery}"`);

      // Single search with combined keywords
      const videos = await getYouTubeVideos(searchQuery, 5);
      
      // Sort by view count and get top video
      const sortedVideos = videos.sort((a, b) => parseInt(b.viewCount) - parseInt(a.viewCount));
      const topVideoUrl = sortedVideos.length > 0 ? sortedVideos[0].url : inspiration.source;

      enhanced.push({
        ...inspiration,
        source: topVideoUrl // Replace source with top YouTube video URL
      });

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200));

    } catch (error) {
      console.error(`Error enhancing inspiration "${inspiration.title}":`, error);
      // Add without YouTube enhancement if there's an error
      enhanced.push(inspiration);
    }
  }

  return enhanced;
}

export async function GET() {
    try {
        console.log('[API][Starting] Getting content inspiration with YouTube integration...');
        
        // Get content inspiration from Gemini
        const geminiResponse = await getContentInspirationFromTrends();
        console.log(`[API][Gemini] Found ${geminiResponse.length} inspirations`);

        // Enhance with YouTube Videos
        const enhancedResponse = await enhanceWithYouTubeVideos(geminiResponse);
        console.log(`[API][YouTube] Enhanced ${enhancedResponse.length} inspirations with YouTube data`);

        // Save to Supabase - source field now contains top YouTube video URL
        const supabase = createServiceClient();
        const { error } = await supabase
          .from('content_inspiration')
          .insert(enhancedResponse);

        if (error) {
            console.error('[Supabase][Insert Error]', error);
        }

        console.log('[API][Success] Enhanced content inspiration with YouTube videos');
        return NextResponse.json(enhancedResponse, { status: 200 });

    } catch (err) {
        console.error('[ERROR]', err);
        return NextResponse.json({
            error: 'Failed to generate enhanced content inspiration',
            details: err instanceof Error ? err.message : 'Unknown error'
        }, { status: 500 });
    }
}