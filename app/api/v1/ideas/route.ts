import { NextResponse } from 'next/server';
import { getContentInspirationFromTrends } from '@/lib/ai/gemini-service';
import { createServiceClient } from '@/utils/supabase/service';

export async function GET() {
    try {
        const geminiResponse = await getContentInspirationFromTrends();
        const supabase = createServiceClient();

        const { error } = await supabase.from('content_inspiration').insert(geminiResponse);
        if (error) {
            console.error('[Supabase][Insert Error]', error);
        }

        console.log('[API][Gemini Trends] Response:', geminiResponse);
        return NextResponse.json(geminiResponse, { status: 200 });
    } catch (err) {
        console.error('[ERROR]', err);
        return NextResponse.json({
            error: 'Failed',
            details: err instanceof Error ? err.message : 'Unknown error'
        }, { status: 500 });
    }
} 