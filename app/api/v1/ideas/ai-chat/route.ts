import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { GoogleGenAI } from '@google/genai';

// Helper: parse Gemini response for action commands (simple JSON convention)
function extractActionFromGemini(text: string) {
  try {
    const match = text.match(/```json([\s\S]*?)```/);
    if (match) {
      return JSON.parse(match[1]);
    }
    // fallback: try to parse any JSON in the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {}
  return null;
}

const allowedFields = ['hook', 'visual_style', 'content_angle', 'target_audience', 'rationale', 'title', 'description'];

const brandContext = `BRAND CONTEXT:
Final Round AI is an AI‑powered interview coach and career accelerator that guides candidates through every stage—from resume creation to live interview simulations and post‑session feedback. Serving over 300,000+ offers and 1.2M+ interviews, the brand offers tools like:
- Interview Copilot: a real‑time assistant during live and mock interviews, offering question prompts, structured frameworks, code guidance, and soft‑skill cues.
- AI Resume & Cover Letter Builder: ATS‑optimized materials personalized to users' experience and roles.
- Mock Interviews & Question Bank: industry‑specific practice with customizable Q&A and performance analytics
- Coding Copilot: live coding help during technical interviews (debugging, pattern hints)
- Post‑Interview Reports: evaluation of strengths, areas to improve, confidence metrics, and sentiment breakdown
Target audience: Early to mid‑career tech professionals—software engineers, data scientists, product managers, and tech-savvy career changers—especially those preparing for high‑stakes interviews at top companies.
Brand personality: Professional, empowering, and tech‑driven—balancing polished, ATS‑grade visuals and UI with trustworthy support. It positions itself as both a mentor and a stealthy backstage coach, blending human mentorship with AI efficiency.`;

export async function POST(request: NextRequest) {
  try {
    const { ideaId, messages }: { ideaId: string; messages: Array<{ role: string; content: string }> } = await request.json();
    if (!ideaId || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    const supabase = await createClient();
    // Fetch the idea
    const { data: idea, error: ideaError } = await supabase
      .from('content_ideas')
      .select('*')
      .eq('id', ideaId)
      .single();
    if (ideaError || !idea) {
      return NextResponse.json({ error: 'Idea not found' }, { status: 404 });
    }
    
    // Check if user is asking for example content/post
    const lastUserMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
    const isAskingForExample = lastUserMessage.includes('example') || 
                               lastUserMessage.includes('post') || 
                               lastUserMessage.includes('tweet') || 
                               lastUserMessage.includes('content') ||
                               lastUserMessage.includes('write') ||
                               lastUserMessage.includes('generate');
    
    // Prepare Gemini prompt
    const systemPrompt = `You are an expert AI content strategist and agent for Final Round AI. Your job is to help users iteratively improve and transform their content ideas so they are more creative, actionable, and aligned with the brand's mission, voice, and audience.

${brandContext}

You have access to the current content idea (see below) and can update any of its fields when the user requests or when you see a clear opportunity for improvement.

**DATABASE FIELD NAMES (use these exact names):**
- hook: The opening line that grabs attention
- visual_style: Description of visual elements and style
- content_angle: The specific perspective or approach for the content
- target_audience: Who the content is aimed at
- rationale: Why this content would work
- title: The main title/headline
- description: Detailed description of the content

**Your goals:**
- Make the idea more compelling, original, and likely to perform well for the target audience.
- Ensure all changes are consistent with Final Round AI's brand, tone, and value proposition.
- Suggest improvements that are specific, high-quality, and actionable (not just surface-level edits).
- You may update multiple fields at once if it will make the idea stronger.
- If the user asks for a specific change, do it and explain why it helps.
- If you see a better way to achieve the user's goal, suggest it.

**IMPORTANT: When users ask for example posts, tweets, or content, respond with ONLY the plain text content. No markdown formatting, no explanations, no additional text - just the actual post/tweet/content they requested.**

**Current idea:**
${JSON.stringify(idea, null, 2)}

**How to reply:**
${isAskingForExample ? 
  'If the user is asking for an example post, tweet, or content, respond with ONLY the plain text content. No markdown, no explanations, no formatting - just the actual content.' :
  `1. Write your reasoning and summary of changes in plain text only.
2. If you are making changes, include a JSON block in one of these formats:

For single field:
\`\`\`json
{
  "action": "update",
  "field": "hook",
  "value": "New hook text"
}
\`\`\`
For multiple fields:
\`\`\`json
{
  "action": "update",
  "updates": [
    { "field": "hook", "value": "New hook text" },
    { "field": "rationale", "value": "New rationale" }
  ]
}
\`\`\`
If no changes are needed, just reply in markdown.`
}

**Chat history:**
`;
    const chatHistory = messages.map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n');
    const prompt = `${systemPrompt}${chatHistory}\n\nRespond as the AI agent.`;
    const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_FREE! });
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    const aiText = response?.text || '';
    
    // For example requests, return the plain text directly
    if (isAskingForExample) {
      return NextResponse.json({
        aiMessage: aiText.trim(),
        updatedIdea: null,
        action: null,
      });
    }
    
    // Check for action
    const action: Record<string, unknown> | null = extractActionFromGemini(aiText);
    let updatedIdea = null;
    if (action && action.action === 'update') {
      const updateObj: Record<string, unknown> = {};
      if (Array.isArray(action.updates)) {
        // Multi-field update
        for (const upd of action.updates as Array<{ field: string; value: unknown }>) {
          if (upd && allowedFields.includes(upd.field)) {
            updateObj[upd.field] = upd.value;
          }
        }
      } else if (typeof action.field === 'string' && action.value && allowedFields.includes(action.field)) {
        // Single field update
        updateObj[action.field] = action.value;
      }
      if (Object.keys(updateObj).length > 0) {
        const { data, error } = await supabase
          .from('content_ideas')
          .update(updateObj)
          .eq('id', ideaId)
          .select();
        if (!error && data && data[0]) {
          updatedIdea = data[0];
        }
      }
    }
    return NextResponse.json({
      aiMessage: aiText.replace(/```json[\s\S]*?```/, '').trim(),
      updatedIdea,
      action,
    });
  } catch (error) {
    console.error('AI chat error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 