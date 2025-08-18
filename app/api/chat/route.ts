import { NextRequest, NextResponse } from 'next/server'

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

export async function POST(request: NextRequest) {
  try {
    const { messages, model }: ChatRequest = await request.json()
    
    let response: Response;
    
    if (model.startsWith('gpt')) {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: model,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'OpenAI API error');
      }
      
      return NextResponse.json({ content: data.choices[0].message.content });
      
    } else if (model.startsWith('claude')) {
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.ANTHROPIC_API_KEY!,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: model,
          max_tokens: 1000,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content
          })),
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Anthropic API error');
      }
      
      return NextResponse.json({ content: data.content[0].text });
    }
    
    return NextResponse.json({ message: 'Unsupported model' }, { status: 400 });
    
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      message: 'Error processing request',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}