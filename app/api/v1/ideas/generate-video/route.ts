import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { createWriteStream, unlinkSync } from 'fs';
import { Readable } from 'stream';
import path from 'path';
import os from 'os';
import { createClient } from '@/utils/supabase/server';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_VIDEO;
const BUCKET = 'final-round-ai-files';
const FOLDER = 'videos';

// Enhanced prompt builder that focuses on movement and actions, not appearance
function buildVideoPrompt(idea: any): string {
  const hook = idea.hook || idea.title || '';
  const visualStyle = idea.visual_style || '';
  const description = idea.description || '';
  
  let prompt = '';
  
  // Focus on actions and movements, not the person's appearance
  if (hook) {
    prompt += `The person is presenting and explaining: "${hook}". `;
  }
  
  // Add specific actions and movements
  prompt += `The presenter is speaking directly to camera with natural hand gestures, `;
  prompt += `engaging eye contact, and professional body language. `;
  
  // Add visual style as camera and lighting direction
  if (visualStyle) {
    prompt += `Visual presentation style: ${visualStyle}. `;
  }
  
  // Add content context for the presentation style
  if (description) {
    const shortDescription = description.substring(0, 150) + (description.length > 150 ? '...' : '');
    prompt += `Content context for presentation: ${shortDescription}. `;
  }
  
  // Add platform-specific movement and energy
  const movementStyle = getMovementStyle(idea);
  if (movementStyle) {
    prompt += `Movement and energy: ${movementStyle}. `;
  }
  
  // Add camera work suggestions
  const cameraWork = getCameraWorkFromPlatform(idea);
  if (cameraWork) {
    prompt += `Camera work: ${cameraWork}. `;
  }
  
  // Add negative prompt to avoid weird text and artifacts
  const negativePrompt = getNegativePrompt(idea);
  
  return negativePrompt ? `${prompt.trim()}\n\nNegative prompt: ${negativePrompt}` : prompt.trim();
}

function getMovementStyle(idea: any): string {
  const platform = idea.platform?.toLowerCase() || '';
  const contentType = idea.content_type?.toLowerCase() || '';
  
  if (platform === 'tiktok') {
    return 'energetic and dynamic presentation, expressive hand gestures, engaging facial expressions';
  }
  
  if (platform === 'instagram') {
    return 'confident and polished presentation, smooth natural movements, professional demeanor';
  }
  
  if (platform === 'linkedin') {
    return 'professional and authoritative presentation, measured gestures, business-appropriate energy';
  }
  
  return 'natural and engaging presentation, appropriate hand gestures, confident delivery';
}

function getCameraWorkFromPlatform(idea: any): string {
  const platform = idea.platform?.toLowerCase() || '';
  
  if (platform === 'tiktok') {
    return 'slight zoom-ins for emphasis, dynamic but stable framing, mobile-friendly composition';
  }
  
  if (platform === 'instagram') {
    return 'professional framing, smooth subtle movements, Instagram-optimized composition';
  }
  
  if (platform === 'linkedin') {
    return 'steady professional framing, minimal camera movement, business-appropriate composition';
  }
  
  return 'stable professional framing with subtle movements for emphasis';
}

function getNegativePrompt(idea: any): string {
  const platform = idea.platform?.toLowerCase() || '';
  
  const commonNegatives = [
    'blurry', 'low quality', 'distorted', 'pixelated', 'amateur',
    'cluttered background', 'poor lighting', 'shaky camera',
    'text overlays', 'captions', 'subtitles', 'on-screen text',
    'weird text', 'floating text', 'random words',
    'deformed hands', 'extra fingers', 'distorted face',
    'multiple people', 'crowd', 'audience in background'
  ];
  
  if (platform === 'instagram' || platform === 'linkedin') {
    commonNegatives.push('unprofessional', 'casual setting', 'messy environment');
  }
  
  if (platform === 'tiktok') {
    commonNegatives.push('boring', 'static', 'slow-paced', 'lifeless');
  }
  
  return commonNegatives.join(', ');
}

// Function to download and prepare base image
async function downloadAndPrepareImage(imageUrl: string): Promise<Buffer> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }
  
  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// Cross-platform temp directory function
function getTempDir(): string {
  return os.tmpdir();
}

export async function POST(request: NextRequest) {
  try {
    const { id, baseImageUrl } = await request.json();
    
    if (!id || !GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Missing id or api key' }, { status: 400 });
    }

    const supabase = await createClient();
    
    // Fetch the content_ideas row
    const { data: idea, error: ideaError } = await supabase
      .from('content_ideas')
      .select(`
        id, title, description, visual_style, content_angle, 
        target_audience, content_type, platform, tags, generated,
        hook
      `)
      .eq('id', id)
      .single();

    if (ideaError || !idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }

    // Build enhanced prompt focusing on actions, not appearance
    const enhancedPrompt = buildVideoPrompt(idea);
    
    console.log('Generated prompt:', enhancedPrompt);

    // Start the async video generation process
    (async () => {
      try {
        const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
        
        let operation;
        
        // Use image-to-video if baseImageUrl is provided
        if (baseImageUrl) {
          console.log('Using image-to-video generation with base image:', baseImageUrl);
          
          // Download the base image
          const imageBuffer = await downloadAndPrepareImage(baseImageUrl);
          
          // Create image-to-video generation with correct API structure
          operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: enhancedPrompt,
            image: {
              imageBytes: imageBuffer.toString('base64'),
              mimeType: 'image/jpeg', // Use appropriate MIME type
            },
            config: {
              personGeneration: 'allow_all',
              aspectRatio: getAspectRatio(idea.platform),
              durationSeconds: 8,
            },
          });
        } else {
          // Fallback to text-to-video with enhanced prompt
          console.log('Using text-to-video generation');
          
          operation = await ai.models.generateVideos({
            model: 'veo-2.0-generate-001',
            prompt: enhancedPrompt,
            config: {
              personGeneration: 'allow_all',
              aspectRatio: getAspectRatio(idea.platform),
              durationSeconds: 8,
            },
          });
        }

        // Poll until operation is done (max 5 minutes)
        let pollCount = 0;
        while (!operation.done && pollCount < 30) {
          await new Promise((resolve) => setTimeout(resolve, 10000));
          operation = await ai.operations.getVideosOperation({ operation });
          pollCount++;
          console.log(`Polling attempt ${pollCount}/30 - Status: ${operation.done ? 'Done' : 'Processing'}`);
        }

        if (!operation.done) {
          console.error('Video generation timed out after 5 minutes');
          return;
        }

        if (!operation.response?.generatedVideos?.length) {
          console.error('No video generated');
          return;
        }

        // Download the first generated video
        const generatedVideo = operation.response.generatedVideos[0];
        const videoUri = generatedVideo.video?.uri;
        
        if (!videoUri) {
          console.error('No video URI returned');
          return;
        }

        const videoUrlWithKey = `${videoUri}&key=${GEMINI_API_KEY}`;
        const resp = await fetch(videoUrlWithKey);
        
        if (!resp.ok || !resp.body) {
          console.error('Failed to download video:', resp.status, resp.statusText);
          return;
        }

        // Use cross-platform temp directory
        const tempDir = getTempDir();
        const tempFileName = path.join(tempDir, `generated_${id}_${Date.now()}.mp4`);
        const writer = createWriteStream(tempFileName);
        
        if (resp.body) {
          const nodeStream = Readable.fromWeb(resp.body as any);
          await new Promise((resolve, reject) => {
            nodeStream.pipe(writer);
            writer.on('finish', () => resolve(undefined));
            writer.on('error', reject);
          });
        } else {
          return;
        }

        // Upload to Supabase Storage
        const remoteFileName = `${FOLDER}/generated_${id}_${Date.now()}.mp4`;
        const fileBuffer = await import('fs').then(fs => fs.readFileSync(tempFileName));
        
        const { error: uploadError } = await supabase.storage
          .from(BUCKET)
          .upload(remoteFileName, fileBuffer, {
            contentType: 'video/mp4',
            upsert: true,
          });

        // Clean up temp file
        try { 
          unlinkSync(tempFileName); 
        } catch (cleanupErr) {
          console.warn('Failed to cleanup temp file:', cleanupErr);
        }

        if (uploadError) {
          console.error('Error uploading video:', uploadError);
          return;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage.from(BUCKET).getPublicUrl(remoteFileName);
        const videoUrl = publicUrlData?.publicUrl;

        // Update the generated array in content_ideas
        const generatedArr = Array.isArray(idea.generated) ? idea.generated : [];
        if (videoUrl) generatedArr.push(videoUrl);

        await supabase
          .from('content_ideas')
          .update({ 
            generated: generatedArr
          })
          .eq('id', id);

        console.log('Video generation completed successfully');

      } catch (err) {
        console.error('Error generating video:', err);
        
      }
    })();

    // Respond immediately
    return NextResponse.json({ 
      success: true, 
      message: 'Video generation started and will complete in the background.',
      prompt: enhancedPrompt,
      usingBaseImage: !!baseImageUrl
    });

  } catch (err) {
    console.error('Internal server error:', err);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}

function getAspectRatio(platform: string): '16:9' | '9:16' {
  const platformLower = platform?.toLowerCase() || '';
  
  // Portrait platforms
  if (platformLower === 'instagram' || platformLower === 'tiktok' || platformLower === 'youtube-shorts') {
    return '9:16';
  }
  
  // Landscape platforms
  if (platformLower === 'youtube' || platformLower === 'linkedin') {
    return '16:9';
  }
  
  // Default to portrait for social media
  return '9:16';
}