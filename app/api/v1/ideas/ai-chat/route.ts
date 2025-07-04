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
    // Prepare Gemini prompt
    const systemPrompt = `You are an AI agent that helps improve content ideas. You can read and update the idea in the database. Only make changes when the user asks.\n\nCurrent idea:\n${JSON.stringify(idea, null, 2)}\n\nIf the user requests a change, reply with a message and include a JSON block like this:\n\nFor single field:\n\u0060\u0060\u0060json\n{\n  "action": "update",\n  "field": "hook",\n  "value": "New hook text"\n}\n\u0060\u0060\u0060\nFor multiple fields:\n\u0060\u0060\u0060json\n{\n  "action": "update",\n  "updates": [\n    { "field": "hook", "value": "New hook text" },\n    { "field": "rationale", "value": "New rationale" }\n  ]\n}\n\u0060\u0060\u0060\nOtherwise, just reply as normal.`;
    const chatHistory = messages.map((m: { role: string; content: string }) => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join('\n');
    const prompt = `${systemPrompt}\n\nChat history:\n${chatHistory}\n\nRespond as the AI agent.`;
    const genAI = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_FREE! });
    const response = await genAI.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: prompt,
    });
    const aiText = response?.text || '';
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