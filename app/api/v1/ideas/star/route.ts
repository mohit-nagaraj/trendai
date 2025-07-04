import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// PATCH endpoint to star/unstar an idea
export async function PATCH(request: NextRequest) {
  try {
    const { ideaId, isStarred } = await request.json();
    
    if (!ideaId || typeof isStarred !== 'boolean') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('content_ideas')
      .update({ is_starred: isStarred })
      .eq('id', ideaId)
      .select();

    if (error) {
      console.error('Error updating star status:', error);
      return NextResponse.json({ error: 'Failed to update star status' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      idea: data && data[0]
    });

  } catch (error) {
    console.error('Error starring idea:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET endpoint to fetch ideas for a specific inspiration
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inspirationId = searchParams.get('inspirationId');
    const starredOnly = searchParams.get('starredOnly') === 'true';
    
    if (!inspirationId) {
      return NextResponse.json({ error: 'Inspiration ID is required' }, { status: 400 });
    }

    const supabase = await createClient();
    
    let query = supabase
      .from('content_ideas')
      .select('*')
      .eq('inspiration_id', inspirationId)
      .order('created_at', { ascending: false });

    if (starredOnly) {
      query = query.eq('is_starred', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching ideas:', error);
      return NextResponse.json({ error: 'Failed to fetch ideas' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      ideas: data || []
    });

  } catch (error) {
    console.error('Error fetching ideas:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 