import { GoogleGenAI, createUserContent, createPartFromUri } from "@google/genai";

export interface ContentPost {
  id: string;
  post_id: string;
  platform: string;
  post_type: string;
  description: string;
  duration_sec: number;
  publish_time: string;
  post_link: string; // Supabase Storage URL for video/image
  views: number;
  reach: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagement_rate: number;
  performance_score: number;
}

export interface AIAnalysisResult {
  content_themes: string[];
  hook_effectiveness: {
    score: number;
    reasoning: string;
    suggestions: string[];
  };
  visual_analysis: {
    hook_strength: number;
    visual_appeal: number;
    brand_consistency: number;
    key_visual_elements: string[];
    visual_suggestions: string[];
  };
  engagement_drivers: string[];
  target_audience_alignment: {
    score: number;
    reasoning: string;
  };
  performance_category: "high" | "medium" | "low";
  key_insights: string[];
  optimization_suggestions: string[];
}

export interface Trend {
  title: string;
  snippet?: string;
  source: string;
  sources: string[];
  keyword: string;
}

export interface Inspiration {
  title: string;
  original_title: string;
  source: string;
  sources: string[];
  final_score: number;
  description: string;
  keywords: string[];
  relevance_score: number;
  content_angles: string[];
}

function buildAnalysisPrompt(contentPost: ContentPost): string {
  return `
Analyze this Final Round AI social media post for performance insights. You will receive both the post data and the actual video/image content.

POST DATA:
- Platform: ${contentPost.platform}
- Post Type: ${contentPost.post_type}
- Description: "${contentPost.description}"
- Duration: ${contentPost.duration_sec} seconds
- Publish Time: ${contentPost.publish_time}

PERFORMANCE METRICS:
- Views: ${contentPost.views}
- Reach: ${contentPost.reach}
- Likes: ${contentPost.likes}
- Comments: ${contentPost.comments}
- Shares: ${contentPost.shares}
- Saves: ${contentPost.saves}
- Engagement Rate: ${contentPost.engagement_rate}%
- Performance Score: ${contentPost.performance_score}/100

VISUAL CONTENT ANALYSIS:
Analyze the provided video/image for:
1. Visual hook strength in first 3 seconds (for videos) or immediate visual impact (for images)
2. Brand consistency with Final Round AI's professional tech interview prep brand
3. Visual appeal and production quality
4. Key visual elements (text overlays, animations, graphics, presenter appearance)
5. Visual storytelling effectiveness

BRAND CONTEXT:
Final Round AI is an AI‑powered interview coach and career accelerator that guides candidates through every stage—from resume creation to live interview simulations and post‑session feedback. Serving over 300,000+ offers and 1.2M+ interviews, the brand offers tools like:
- Interview Copilot: a real‑time assistant during live and mock interviews, offering question prompts, structured frameworks, code guidance, and soft‑skill cues.
- AI Resume & Cover Letter Builder: ATS‑optimized materials personalized to users' experience and roles.
- Mock Interviews & Question Bank: industry‑specific practice with customizable Q&A and performance analytics
- Coding Copilot: live coding help during technical interviews (debugging, pattern hints)
- Post‑Interview Reports: evaluation of strengths, areas to improve, confidence metrics, and sentiment breakdown
Target audience: Early to mid‑career tech professionals—software engineers, data scientists, product managers, and tech-savvy career changers—especially those preparing for high‑stakes interviews at top companies.
Brand personality: Professional, empowering, and tech‑driven—balancing polished, ATS‑grade visuals and UI with trustworthy support. It positions itself as both a mentor and a stealthy backstage coach, blending human mentorship with AI efficiency.

ANALYSIS REQUIREMENTS:
Provide detailed analysis in the following JSON structure:
{
  "content_themes": ["theme1", "theme2", "theme3"],
  "hook_effectiveness": {
    "score": 1-10,
    "reasoning": "detailed explanation of both text and visual hook strength",
    "suggestions": ["improvement1", "improvement2"]
  },
  "visual_analysis": {
    "hook_strength": 1-10,
    "visual_appeal": 1-10,
    "brand_consistency": 1-10,
    "key_visual_elements": ["element1", "element2", "element3"],
    "visual_suggestions": ["suggestion1", "suggestion2", "suggestion3"]
  },
  "engagement_drivers": ["driver1", "driver2", "driver3"],
  "target_audience_alignment": {
    "score": 1-10,
    "reasoning": "how well content matches target audience based on both text and visuals"
  },
  "performance_category": "high|medium|low",
  "key_insights": ["insight1", "insight2", "insight3"],
  "optimization_suggestions": ["suggestion1", "suggestion2", "suggestion3"]
}

Focus on actionable insights for improving future content performance, considering both textual and visual elements. Return only valid JSON.
`;
}

async function downloadMediaFromSupabase(url: string): Promise<{ buffer: Buffer; mimeType: string }> {
  console.log(`[Gemini] Downloading media from Supabase: ${url}`);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download media: ${response.statusText}`);
  }
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  // Guess mime type from extension
  const ext = url.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
    mp4: 'video/mp4', mov: 'video/quicktime', avi: 'video/x-msvideo', mkv: 'video/x-matroska', webm: 'video/webm'
  };
  const mimeType = mimeTypes[ext || ''] || 'application/octet-stream';
  console.log(`[Gemini] Downloaded media (${buffer.length} bytes, mimeType: ${mimeType})`);
  return { buffer, mimeType };
}

const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_VIDEO! });

export async function analyzeContentWithGemini(contentPost: ContentPost): Promise<AIAnalysisResult> {
  const prompt = buildAnalysisPrompt(contentPost);
  let contents;
  if (contentPost.post_link) {
    const { buffer, mimeType } = await downloadMediaFromSupabase(contentPost.post_link);
    if (buffer.length < 20 * 1024 * 1024) {
      console.log(`[Gemini] Using inlineData for media (<20MB)`);
      contents = [
        {
          inlineData: {
            mimeType,
            data: buffer.toString('base64'),
          },
        },
        { text: prompt },
      ];
    } else {
      console.log(`[Gemini] Using File API for media (>20MB)`);
      // @ts-expect-error: No types for tmp-promise
      const tmp = await import('tmp-promise');
      const fs = await import('fs/promises');
      let ext = 'bin';
      if (mimeType && mimeType.includes('/')) {
        const split = mimeType.split('/');
        if (split[1]) ext = split[1];
      }
      const tmpFile = await tmp.file({ postfix: '.' + ext });
      let tmpPath = tmpFile['path'];
      if (typeof tmpPath !== 'string') {
        // Try to resolve from file descriptor (Linux only)
        if (typeof tmpFile.fd === 'number') {
          tmpPath = `/proc/self/fd/${tmpFile.fd}`;
        } else {
          tmpPath = '';
        }
      }
      const safeTmpPath: string = typeof tmpPath === 'string' && tmpPath ? tmpPath : '';
      if (!safeTmpPath) throw new Error('Failed to create temp file for Gemini upload');
      await fs.writeFile(safeTmpPath, buffer);
      try {
        const myfile = await genAI.files.upload({
          file: safeTmpPath,
          config: { mimeType: mimeType || 'application/octet-stream' },
        });
        console.log(`[Gemini] Uploaded file to Gemini File API:`, myfile);
        contents = createUserContent([
          createPartFromUri(String(myfile.uri ?? ''), String(myfile.mimeType ?? '')),
          prompt,
        ]);
      } finally {
        await tmpFile.cleanup();
      }
    }
  } else {
    console.log(`[Gemini] No media attached, using text-only prompt`);
    contents = [{ text: prompt }];
  }

  console.log(`[Gemini] Sending prompt to Gemini:`, prompt);
  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-pro',
    contents,
  });
  console.log(`[Gemini] Gemini API response:`, response);
  const text = response?.text;
  console.log(`[Gemini] Gemini response text:`, text);
  const jsonMatch = text && text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.error(`[Gemini] No JSON found in Gemini response`);
    throw new Error('No JSON found in Gemini response');
  }
  const parsed = JSON.parse(jsonMatch[0]) as AIAnalysisResult;
  console.log(`[Gemini] Parsed AIAnalysisResult:`, parsed);
  return parsed;
}

const careerKeywords = [
  'job interview tips',
  'resume optimization',
  'career change',
  'tech interview',
  'coding interview',
  'AI career',
];

/**
 * Main exported function: gets content inspiration for Final Round AI based on real-time career trends.
 * Uses a single Gemini call with Google Search grounding.
 * Returns the inspiration array.
 */
export async function getContentInspirationFromTrends(): Promise<Inspiration[]> {
  const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_VIDEO! });
  const groundingTool = { googleSearch: {} };
  const config = { tools: [groundingTool] };
  const brandContext = `\nBRAND CONTEXT:\nFinal Round AI is an AI‑powered interview coach and career accelerator that guides candidates through every stage—from resume creation to live interview simulations and post‑session feedback. Serving over 300,000+ offers and 1.2M+ interviews, the brand offers tools like:\n- Interview Copilot: a real‑time assistant during live and mock interviews, offering question prompts, structured frameworks, code guidance, and soft‑skill cues.\n- AI Resume & Cover Letter Builder: ATS‑optimized materials personalized to users' experience and roles.\n- Mock Interviews & Question Bank: industry‑specific practice with customizable Q&A and performance analytics\n- Coding Copilot: live coding help during technical interviews (debugging, pattern hints)\n- Post‑Interview Reports: evaluation of strengths, areas to improve, confidence metrics, and sentiment breakdown\nTarget audience: Early to mid‑career tech professionals—software engineers, data scientists, product managers, and tech-savvy career changers—especially those preparing for high‑stakes interviews at top companies.\nBrand personality: Professional, empowering, and tech‑driven—balancing polished, ATS‑grade visuals and UI with trustworthy support. It positions itself as both a mentor and a stealthy backstage coach, blending human mentorship with AI efficiency.\n`;
  const prompt = `You are an expert content strategist for Final Round AI (an interview coaching platform).\n\nUsing real-time web search (Google Search grounding), find the latest trends, news, or discussions relevant to the following career topics:\n${careerKeywords.map(k => `- ${k}`).join('\n')}\n\nFor each unique trend or news item you find, provide:\n1. A refined title that's catchy and relevant to Final Round AI\n2. The original title\n3. The primary source (main url) and all sources (array of urls)\n4. A final score (1-100) based on relevance, engagement, and potential for content creation\n5. An enhanced description explaining why this trend matters for job seekers\n6. Relevant keywords\n7. A relevance score (1-100)\n8. Content angle suggestions for Final Round AI (array of 2-4 ideas)\n\n${brandContext}\n\nReturn a JSON array with this structure:\n[\n  {\n    "title": "refined title",\n    "original_title": "original title",\n    "source": "primary source",\n    "sources": ["all sources"],\n    "final_score": 85,\n    "description": "enhanced description",\n    "keywords": ["relevant", "keywords"],\n    "relevance_score": 90,\n    "content_angles": ["angle 1", "angle 2", "angle 3"]\n  }\n]\nIf you cannot find any trends for a topic, skip it. Only include real, recent trends. Return only valid JSON.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config,
    });
    const text = response?.text || '';
    const cleanedText = text.replace(/```json|```/g, '').trim();
    // Try to extract JSON array
    const jsonMatch = cleanedText.match(/\[.*\]/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    // fallback: try to parse whole text
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Gemini inspiration error:', error);
    return [];
  }
} 