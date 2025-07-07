import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'node:fs';
import path from 'path';
import sharp from 'sharp';

const appKey = process.env.NEXT_PUBLIC_TWITTER_APP_KEY;
const appSecret = process.env.NEXT_PUBLIC_TWITTER_APP_SECRET;
const accessToken = process.env.NEXT_PUBLIC_TWITTER_ACCESS_TOKEN;
const accessSecret = process.env.NEXT_PUBLIC_TWITTER_ACCESS_SECRET;
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_FREE || process.env.NEXT_PUBLIC_GEMINI_VIDEO;

// Helper: Overlay logo on image (from ideas/generate-image)
async function overlayLogo(imageBuffer: Buffer, logoPath: string) {
  const logoBuffer = fs.readFileSync(logoPath);
  const { width, height } = await sharp(imageBuffer).metadata();
  const logoSize = Math.min(Math.floor((width) * 0.15), 150);
  const logoLeft = (width || 0) - logoSize - 20;
  const logoTop = 20;
  const processedLogo = await sharp(logoBuffer)
    .resize(logoSize, logoSize, { fit: 'inside', withoutEnlargement: true })
    .png()
    .toBuffer();
  const finalImage = await sharp(imageBuffer)
    .composite([
      { input: processedLogo, top: logoTop, left: logoLeft, blend: 'over' }
    ])
    .png()
    .toBuffer();
  return finalImage;
}

// Helper: Build Ghibli-style prompt for Gemini
function buildGhibliPrompt() {
  return `Convert the following image to a Studio Ghibli-inspired illustration. Maintain the main subject and composition, but apply a whimsical, hand-painted, vibrant Ghibli style. Add a clean, professional finish suitable for tech brand social media.\n\nSTYLE REQUIREMENTS:\n- Studio Ghibli-inspired\n- Clean, modern, professional aesthetic\n- High-quality, detailed rendering\n- Optimized for social media engagement\n- Leave space in top-right corner for logo placement (do not add a logo, just leave space)\n- Light, professional color palette with orange accents (#FFDAB9)\n- Minimalist composition focusing on key message\n- High contrast for text readability\n- Balanced composition with clear visual hierarchy`;
}

export async function POST(req: Request) {
  if (!appKey || !appSecret || !accessToken || !accessSecret) {
    return NextResponse.json({ error: 'Missing Twitter API credentials' }, { status: 500 });
  }
  try {
    const body = await req.json();
    const tweet = body.tweet;
    const generateImage = body.generateImage;
    const imageUrl = body.url;
    if (!tweet || typeof tweet !== 'string') {
      return NextResponse.json({ error: 'Missing tweet text' }, { status: 400 });
    }
    let mediaId: string | undefined = undefined;
    if (generateImage && imageUrl && GEMINI_API_KEY) {
      // Generate Ghibli-style image using Gemini
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
      const prompt = buildGhibliPrompt();
      // Use Gemini's image-to-image generation (simulate by sending image as inlineData)
      // Download the image from the URL
      const response = await fetch(imageUrl);
      if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch image from url' }, { status: 400 });
      }
      const arrayBuffer: ArrayBuffer = await response.arrayBuffer();
      const inputImageBuffer = Buffer.from(new Uint8Array(arrayBuffer));
      const base64Image = inputImageBuffer.toString('base64');
      const contents = [
        { text: prompt },
        {
          inlineData: {
            mimeType: 'image/png',
            data: base64Image,
          },
        },
      ];
      const geminiResponse = await ai.models.generateContent({
        model: 'gemini-2.0-flash-preview-image-generation',
        contents,
        config: { responseModalities: ['TEXT', 'IMAGE'] },
      });
      let imageBuffer: Buffer | undefined = undefined;
      if (geminiResponse?.candidates && geminiResponse.candidates[0]?.content?.parts) {
        for (const part of geminiResponse.candidates[0].content.parts) {
          if (part.inlineData) {
            imageBuffer = Buffer.from(part.inlineData.data??"", 'base64');
          }
        }
      }
      if (!imageBuffer) {
        return NextResponse.json({ error: 'Gemini did not return a valid image' }, { status: 500 });
      }
      // Overlay logo
      const logoPath = path.join(process.cwd(), 'public', 'Final Round AI.png');
      imageBuffer = await overlayLogo(imageBuffer, logoPath);
      // Upload image to Twitter
      const client = new TwitterApi({ appKey, appSecret, accessToken, accessSecret });
      const rwClient = client.readWrite;
      const media = await rwClient.v2.uploadMedia(imageBuffer, { media_type: 'image/png' });
      mediaId = media;
    }
    // Post tweet (with or without media)
    const client = new TwitterApi({ appKey, appSecret, accessToken, accessSecret });
    const rwClient = client.readWrite;
    let tweetData;
    if (mediaId) {
      tweetData = await rwClient.v2.tweet({ text: tweet, media: { media_ids: [mediaId] } });
    } else {
      tweetData = await rwClient.v2.tweet(tweet);
    }
    return NextResponse.json({ tweet: tweetData.data, imageUsed: !!mediaId }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
} 