import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, PersonGeneration } from '@google/genai';
import * as fs from 'node:fs';
import path from 'path';
import { createClient } from '@/utils/supabase/server';
import sharp from 'sharp'; // You'll need to install: npm install sharp

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_VIDEO;
const BUCKET = 'final-round-ai-files';
const FOLDER = 'videos';

// Helper function to build optimized prompt for Imagen 3
function buildImagen3Prompt(idea:any) {
  const prompt = `Professional ${idea.content_type.toLowerCase()} design for ${idea.platform} social media.

CONTENT: "${idea.title}"

STYLE REQUIREMENTS:
${idea.visual_style}

DESIGN SPECIFICATIONS:
- Clean, modern, professional aesthetic
- High-quality, detailed rendering
- Optimized for social media engagement
- Leave space in top-right corner for logo placement
- Light, professional color palette with orange accents (#FFDAB9)
- Modern sans-serif typography when text is included
- Minimalist composition focusing on key message
- Studio Ghibli-inspired elements if showing people or scenery
- Corporate professional style for business content
- High contrast for text readability
- Balanced composition with clear visual hierarchy

TECHNICAL:
- High resolution
- Clean edges
- Professional finish
- Social media optimized aspect ratio`;

  return prompt;
}

// Helper function to describe logo for text-only generation
function buildLogoDescription() {
  return `LOGO PLACEMENT: Reserve clean space in top-right corner for "Final Round AI" company logo watermark. The logo should be subtly placed, professional, and not interfere with main content.`;
}

// Function to overlay logo on generated image
async function overlayLogo(imageBuffer:any, logoPath:any) {
  try {
    const logoBuffer = fs.readFileSync(logoPath);
    
    // Get image dimensions
    const { width, height } = await sharp(imageBuffer).metadata();
    
    // Calculate logo size (10% of image width, max 150px)
    const logoSize = Math.min(Math.floor(width * 0.15), 150);
    
    // Position logo in top-right corner with 20px margin
    const logoLeft = width - logoSize - 20;
    const logoTop = 20;
    
    // Resize logo and add subtle drop shadow
    const processedLogo = await sharp(logoBuffer)
      .resize(logoSize, logoSize, { fit: 'inside', withoutEnlargement: true })
      .png()
      .toBuffer();
    
    // Overlay logo on the generated image
    const finalImage = await sharp(imageBuffer)
      .composite([
        {
          input: processedLogo,
          top: logoTop,
          left: logoLeft,
          blend: 'over'
        }
      ])
      .png()
      .toBuffer();
    
    return finalImage;
  } catch (error) {
    console.error('Logo overlay error:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id, useImagen3 = true } = await request.json();
    
    if (!id || !GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Missing id or api key' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Fetch the content_ideas row
    const { data: idea, error: ideaError } = await supabase
      .from('content_ideas')
      .select('id, title, description, visual_style, content_angle, target_audience, content_type, platform, tags, generated')
      .eq('id', id)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const logoPath = path.join(process.cwd(), 'public', 'Final Round AI.png');
    
    let imageBuffer;
    let generatedText = null;

    if (useImagen3) {
      // Use Imagen 3 for higher quality
      const prompt = buildImagen3Prompt(idea) + '\n\n' + buildLogoDescription();
      
      const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          aspectRatio: idea.platform === 'instagram' ? '1:1' : '16:9', // Adjust based on platform
          personGeneration: PersonGeneration.ALLOW_ALL
        },
      });

      if (!response.generatedImages || response.generatedImages.length === 0) {
        return NextResponse.json({ 
          error: 'Imagen 3 did not generate any images' 
        }, { status: 500 });
      }

      // Get the first generated image
      const generatedImage = response.generatedImages[0];
      imageBuffer = Buffer.from(String((generatedImage.image && generatedImage.image.imageBytes) || ''), 'base64');
      
      // Overlay logo on the generated image
      imageBuffer = await overlayLogo(imageBuffer, logoPath);
      
    } else {
      // Fallback to Gemini 2.0 Flash with logo input (your original approach)
      const optimizedPrompt = buildImagen3Prompt(idea);
      const imageData = fs.readFileSync(logoPath);
      const base64Image = imageData.toString('base64');

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
        model: 'gemini-2.0-flash-preview-image-generation',
        contents,
        config: {
          responseModalities: ['TEXT', 'IMAGE'],
        },
      });

      if (!response?.candidates || !response.candidates[0]?.content?.parts) {
        return NextResponse.json({ 
          error: 'Gemini Flash did not return a valid response' 
        }, { status: 500 });
      }

      // Process response
      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          generatedText = part.text;
        } else if (part.inlineData) {
          imageBuffer = Buffer.from(part.inlineData.data ?? '', 'base64');
        }
      }
    }

    if (!imageBuffer) {
      return NextResponse.json({ 
        error: 'No image generated',
        generatedText 
      }, { status: 500 });
    }

    // Upload to Supabase Storage
    const remoteFileName = `${FOLDER}/generated_${id}_${Date.now()}.png`;
    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(remoteFileName, imageBuffer, { 
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
    
    const imageUrl = publicUrlData?.publicUrl;

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
      modelUsed: useImagen3 ? 'Imagen 3' : 'Gemini 2.0 Flash',
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