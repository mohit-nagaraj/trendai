import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/utils/supabase/service';
import { generateContentIdeasWithGemini, isInspiration } from '@/lib/ai/gemini-service';

export async function POST(request: NextRequest) {
  try {
    const { inspirationId, platforms } = await request.json();
    if (!inspirationId || !platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json({ error: 'Inspiration ID and platforms are required' }, { status: 400 });
    }
    const supabase = createServiceClient();
    // Get the inspiration data
    const { data: inspiration, error: inspirationError } = await supabase
      .from('content_inspiration')
      .select('*')
      .eq('id', inspirationId)
      .single();
    if (inspirationError || !inspiration || !isInspiration(inspiration)) {
      return NextResponse.json({ error: 'Inspiration not found' }, { status: 404 });
    }
    // Generate ideas for all platforms using the shared Gemini service
    const allGeneratedIdeas = await generateContentIdeasWithGemini(inspiration, platforms);
    // Store ideas in database
    const { data: insertedIdeas, error: insertError } = await supabase
      .from('content_ideas')
      .insert(allGeneratedIdeas.map((idea) => (
        (typeof idea === 'object' && idea !== null)
          ? { ...idea, inspiration_id: inspirationId }
          : { inspiration_id: inspirationId }
      )))
      .select();
    if (insertError) {
      console.error('Error inserting ideas:', insertError);
      return NextResponse.json({ error: 'Failed to store ideas' }, { status: 500 });
    }
    return NextResponse.json({
      success: true,
      ideas: insertedIdeas,
      count: insertedIdeas.length,
      platforms: platforms.length
    });
  } catch (error) {
    console.error('Error generating ideas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
