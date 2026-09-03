import { NextRequest, NextResponse } from 'next/server';

const SYSTEM_PROMPT = `You are MediCore's AI Health Assistant — a knowledgeable, empathetic, and professional healthcare companion.

Your role:
- Answer general health, wellness, nutrition, fitness, and medical questions in a clear, friendly tone.
- Always remind users that your advice is informational and not a substitute for professional medical advice.
- Keep responses concise but complete — avoid overwhelming the user.
- Use bullet points or short paragraphs for clarity when helpful.
- Never diagnose diseases or prescribe medications.
- If a question is outside health/wellness, politely redirect to health topics.`;

// Try multiple models in order until one works
const MODELS_TO_TRY = [
  'gemini-3.6-flash',
  'gemini-flash-latest',
  'gemini-3.5-flash',
];

async function callGemini(apiKey: string, model: string, contents: any[]) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents }),
  });
  return res;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return NextResponse.json(
        { error: 'Gemini API key not configured.' },
        { status: 500 }
      );
    }

    // Build contents array with system prompt + conversation history
    const contents = [
      {
        role: 'user',
        parts: [{ text: SYSTEM_PROMPT + '\n\nPlease acknowledge you understand your role.' }],
      },
      {
        role: 'model',
        parts: [{ text: "Understood! I'm MediCore's AI Health Assistant, ready to provide helpful health and wellness information. How can I help you today?" }],
      },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    ];

    // Try each model until one works
    let lastError = '';
    for (const model of MODELS_TO_TRY) {
      try {
        const res = await callGemini(apiKey, model, contents);
        const data = await res.json();

        if (res.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return NextResponse.json({
            content: data.candidates[0].content.parts[0].text,
          });
        }

        lastError = data.error?.message || `Model ${model} failed`;
        console.log(`Model ${model} failed:`, lastError);
      } catch (e: any) {
        lastError = e.message;
        console.log(`Model ${model} threw error:`, e.message);
      }
    }

    return NextResponse.json(
      { error: `AI unavailable: ${lastError}` },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to get AI response. Please try again.' },
      { status: 500 }
    );
  }
}
