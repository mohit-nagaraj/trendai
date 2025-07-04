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
