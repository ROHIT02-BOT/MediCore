import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const SYSTEM_PROMPT = `You are MediCore's AI Health Assistant — a knowledgeable, empathetic, and professional healthcare companion.

Your role:
- Answer general health, wellness, nutrition, fitness, and medical questions in a clear, friendly tone.
- Always remind users that your advice is informational and not a substitute for professional medical advice.
- Keep responses concise but complete — avoid overwhelming the user.
- Use bullet points or short paragraphs for clarity when helpful.
- Never diagnose diseases or prescribe medications.
- If a question is outside health/wellness, politely redirect to health topics.

Start responses warmly and helpfully.`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured.' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Build chat history from previous messages (exclude the last user message)
    const history = messages.slice(0, -1).map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: SYSTEM_PROMPT }],
        },
        {
          role: 'model',
          parts: [{ text: 'Understood! I am MediCore\'s AI Health Assistant. I\'m ready to help with health and wellness questions.' }],
        },
        ...history,
      ],
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ content: text });
  } catch (error: any) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response. Please try again.' },
      { status: 500 }
    );
  }
}
