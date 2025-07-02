import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        
        // Fetch the most recent analytics
        const { data: analyticsData, error } = await supabase
            .from('analytics_cache')
            .select('*')
            .order('generated_at', { ascending: false })
            .limit(1)
            .single();

        if (error) {
            if (error.code === 'PGRST116') {
                return NextResponse.json({ 
                    error: 'No analytics available yet', 
                    status: 'no_data' 
                }, { status: 404 });
            }
            throw error;
        }

        return NextResponse.json({
            status: 'completed',
            generatedAt: analyticsData.generated_at,
            postCount: analyticsData.post_count,
            source: analyticsData.source,
            cards: analyticsData.cards_data
        }, { status: 200 });

    } catch (err) {
        console.error('[ANALYTICS FETCH ERROR]', err);
        return NextResponse.json({ 
            error: 'Failed to fetch analytics', 
            details: err instanceof Error ? err.message : 'Unknown error' 
        }, { status: 500 });
    }
} 