import { NextRequest, NextResponse } from 'next/server';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  model?: string;
}

interface ChatRequest {
  messages: Message[];
  model: string;
}

const SYSTEM_PROMPT = `
You are Hierophant AI, a precise and helpful assistant.

Rules:
- If the user asks you to say/return/print EXACTLY a specific string (e.g., “Say "ok" only.”),
  output **only** that exact string with no extra words, punctuation, emojis, code fences,
  or explanations.
- Otherwise, be concise and helpful.
`;

export async function POST(request: NextRequest) {
  try {
    const { messages, model }: ChatRequest = await request.json();

    // Common options
    const temperature = 0.2;
    const max_tokens = 800;

    if (model.startsWith('gpt')) {
      // OpenAI
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          temperature,
          max_tokens,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.map(m => ({ role: m.role, content: m.content })),
          ],
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'OpenAI API error');
      }
      return NextResponse.json({ content: data.choices[0]?.message?.content ?? '' });
    }

    if (model.startsWith('claude')) {
      // Anthropic
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model,
          max_tokens,
          temperature,
          system: SYSTEM_PROMPT,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error?.message || 'Anthropic API error');
      }
      // Anthropic returns content as an array of blocks
      return NextResponse.json({ content: data?.content?.[0]?.text ?? '' });
    }

    return NextResponse.json({ message: 'Unsupported model' }, { status: 400 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        message: 'Error processing request',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
