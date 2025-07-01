import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const BUCKET = 'final-round-ai-files';
const FOLDER = 'uploads';

export async function POST(req: Request) {
    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file');

    // Check if file is present
    if (!file) {
        return NextResponse.json({ error: 'No CSV file provided' }, { status: 400 });
    }

    // Validate file type and extension
    const fileName = (file as File).name || '';
    const fileType = (file as File).type || '';
    if (!fileName.endsWith('.csv')) {
        return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 });
    }
    if (fileType && fileType !== 'text/csv' && fileType !== 'application/vnd.ms-excel') {
        return NextResponse.json({ error: 'File must be a CSV' }, { status: 400 });
    }

    // Read file as buffer
    const arrayBuffer = await (file as File).arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Prepare Supabase client (server-side) using your util
    const supabase = await createClient();

    // Upload to Supabase Storage
    const uploadPath = `${FOLDER}/${Date.now()}-${fileName.replace(/\s+/g, '_')}`;
    const { data, error } = await supabase.storage.from(BUCKET).upload(uploadPath, buffer, {
        contentType: 'text/csv',
        upsert: false,
    });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Start async processing pipeline
    const processId = `process_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`

    

    return NextResponse.json({ message: 'Success', path: data?.path }, { status: 201 });
}
