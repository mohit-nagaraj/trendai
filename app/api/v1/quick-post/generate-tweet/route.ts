import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_FREE;

const BRAND_CONTEXT = `BRAND CONTEXT:\nFinal Round AI is an AI‑powered interview coach and career accelerator that guides candidates through every stage—from resume creation to live interview simulations and post‑session feedback. Serving over 300,000+ offers and 1.2M+ interviews, the brand offers tools like:\n- Interview Copilot: a real‑time assistant during live and mock interviews, offering question prompts, structured frameworks, code guidance, and soft‑skill cues.\n- AI Resume & Cover Letter Builder: ATS‑optimized materials personalized to users' experience and roles.\n- Mock Interviews & Question Bank: industry‑specific practice with customizable Q&A and performance analytics\n- Coding Copilot: live coding help during technical interviews (debugging, pattern hints)\n- Post‑Interview Reports: evaluation of strengths, areas to improve, confidence metrics, and sentiment breakdown\nTarget audience: Early to mid‑career tech professionals—software engineers, data scientists, product managers, and tech-savvy career changers—especially those preparing for high‑stakes interviews at top companies.\nBrand personality: Professional, empowering, and tech‑driven—balancing polished, ATS‑grade visuals and UI with trustworthy support. It positions itself as both a mentor and a stealthy backstage coach, blending human mentorship with AI efficiency.`;

function buildTweetPrompt(pill: any, hardMode: boolean) {
  if (hardMode) {
    // Hard mode - direct and forceful connection to the brand
    return `You are a social media expert for Final Round AI.\n\nGiven the following news article, write a tweet (max 280 characters) that directly links the news to Final Round AI's brand and mission.\n\nNews Article:\nTitle: ${pill.title}\nDescription: ${pill.description}\nContent: ${pill.content}\nSource: ${pill.source}\n\n${BRAND_CONTEXT}\n\nRequirements:\n- Use emotion appropriate to the news.\n- Make the tweet relevant to tech professionals and career growth.\n- If possible, include a relevant hashtag.\n- Output only the tweet text, no explanation or extra text.`;
  } else {
    // Subtle mode - gentle and natural connection
    return `You are a social media expert for Final Round AI.\n\nGiven the following news article, write a tweet (max 280 characters) that subtly connects the news to career growth and professional development themes that align with Final Round AI's mission.\n\nNews Article:\nTitle: ${pill.title}\nDescription: ${pill.description}\nContent: ${pill.content}\nSource: ${pill.source}\n\n${BRAND_CONTEXT}\n\nRequirements:\n- Make the connection subtle and natural, not forced.\n- Focus on broader career/professional themes rather than directly mentioning Final Round AI.\n- If the news is completely irrelevant to career growth, professional development, or tech industry, respond with "not_processable".\n- Use emotion appropriate to the news.\n- If possible, include a relevant hashtag.\n- Output only the tweet text or "not_processable", no explanation or extra text.`;
  }
}

export async function POST(req: Request) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json({ error: 'Missing Gemini API key' }, { status: 500 });
  }
  try {
    const body = await req.json();
    const pill = body.pill;
    const hardMode = body.hard_mode !== undefined ? body.hard_mode : true;
    
    if (!pill || !pill.title) {
      return NextResponse.json({ error: 'Missing pill data' }, { status: 400 });
    }
    
    const prompt = buildTweetPrompt(pill, hardMode);
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    let tweet = response?.text?.trim() || '';
    // Remove any code block formatting or extra text
    tweet = tweet.replace(/```[a-z]*|```/gi, '').trim();
    
    // Check if the content is not processable (subtle mode)
    if (tweet.toLowerCase().includes('not_processable')) {
      return NextResponse.json({ error: 'not_processable' }, { status: 400 });
    }
    
    // Ensure tweet is max 280 chars
    if (tweet.length > 280) tweet = tweet.slice(0, 277) + '...';
    
    return NextResponse.json({ tweet }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Unknown error' }, { status: 500 });
  }
} 