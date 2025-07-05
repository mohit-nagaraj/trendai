import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Modality } from '@google/genai';
import * as fs from 'node:fs';
import path from 'path';
import { createClient } from '@/utils/supabase/server';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_FREE;
const BUCKET = 'final-round-ai-files';
const FOLDER = 'videos';

// Helper function to build optimized prompt
function buildImagePrompt(idea) {
  // Build structured prompt following Gemini best practices
  const prompt = `Create a professional, high-quality ${idea.content_type.toLowerCase()} image for ${idea.platform}.

CONTENT CONTEXT:
- Title: "${idea.title}"

VISUAL REQUIREMENTS:
${idea.visual_style}
- Use clean typography and balanced composition
if Text-based image needs to be generated:
- Background: Simple, clean, light orange (#FFDAB9 or similar pastel orange) to ensure readability.
- Typography: Easy-to-read, modern sans-serif font (e.g., Montserrat, Open Sans, Lato) in a contrasting dark color (e.g., dark grey, black) for maximum legibility.
- Composition: Minimalist, focusing on the text as the primary element. Avoid complex patterns or distracting imagery.
- Overall feeling: Clean, professional, and direct.
if Image consisting of humans or scenery:
- Art Style: Ghibli-inspired animation style. Focus on warm, inviting colors, soft lighting, and detailed natural elements or character expressions characteristic of Studio Ghibli films.
- Composition: Evoke a sense of wonder, journey, or connection (depending on the specific scene).
- Overall feeling: Dreamy, nostalgic, and enchanting.

BRANDING REQUIREMENTS:
- Place "Final Round AI" company name and logo in the top right corner as a watermark
- Use the provided logo image as reference for branding
- Maintain professional and clean light color aesthetic
- Colors should align with tech/career coaching brand identity

TECHNICAL SPECIFICATIONS:
- High resolution, professional quality but simple design
- Clean, modern design that stands out in social feeds
- Ensure text elements are clearly readable
- Balance visual appeal with information hierarchy
`;

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    if (!id || !GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Missing id or api key' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Fetch the content_ideas row with optimized field selection
    const { data: idea, error: ideaError } = await supabase
      .from('content_ideas')
      .select('id, title, description, visual_style, content_angle, target_audience, content_type, platform, tags, generated')
      .eq('id', id)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    // Prepare logo image
    const logoPath = path.join(process.cwd(), 'public', 'Final Round AI.png');
    const imageData = fs.readFileSync(logoPath);
    const base64Image = imageData.toString('base64');

    // Build optimized prompt
    const optimizedPrompt = buildImagePrompt(idea);

    // Generate image with Gemini using improved prompt structure
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    const contents = [
      { text: optimizedPrompt },
      {
        inlineData: {
          mimeType: 'image/png',
          data: base64Image,
        },
      },
    ];

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-preview-image-generation', // Using the experimental model as per docs
      contents,
      config: {
        responseModalities: [Modality.TEXT, Modality.IMAGE],
      },
    });

    if (!response?.candidates || !response.candidates[0]?.content?.parts) {
      return NextResponse.json({ 
        error: 'Gemini did not return a valid image response', 
        details: response 
      }, { status: 500 });
    }

    let imageUrl = null;
    let generatedText = null;

    // Process both text and image responses
    for (const part of response.candidates[0].content.parts) {
      if (part.text) {
        generatedText = part.text;
        console.log('Generated text:', part.text);
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        if (!imageData) continue;

        // Upload to Supabase Storage
        const remoteFileName = `${FOLDER}/generated_${id}_${Date.now()}.png`;
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(remoteFileName, Buffer.from(imageData, 'base64'), { 
            contentType: 'image/png', 
            upsert: true 
          });

        if (uploadError) {
          console.error('Supabase upload error:', uploadError);
          return NextResponse.json({ 
            error: 'Failed to upload image', 
            details: uploadError.message 
          }, { status: 500 });
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET)
          .getPublicUrl(remoteFileName);
        
        imageUrl = publicUrlData?.publicUrl;
      }
    }

    if (!imageUrl) {
      return NextResponse.json({ 
        error: 'Image generation failed - no image data received',
        generatedText // Include any text that was generated for debugging
      }, { status: 500 });
    }

    // Update the generated array in content_ideas
    const generatedArr = Array.isArray(idea.generated) ? idea.generated : [];
    if (imageUrl) generatedArr.push(imageUrl);

    const { error: updateError } = await supabase
      .from('content_ideas')
      .update({ generated: generatedArr })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ 
        error: 'Failed to update generated array', 
        details: updateError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      generatedText: generatedText || 'No text generated'
    });

  } catch (err) {
    console.error('Internal server error:', err);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}