import { NextRequest } from 'next/server';

const SYSTEM_PROMPT = `You are MediCore's AI Health Assistant — a knowledgeable, empathetic, and professional healthcare companion.

When a user mentions any symptom, illness, or health condition (e.g. fever, cold, headache, cough, pain), you MUST always provide:
1. **What it is** — brief explanation of the condition
2. **Precautions** — what the user should do and avoid
3. **Home Remedies** — practical things they can do at home
4. **When to See a Doctor** — warning signs that need professional attention

Format your response clearly with these sections using bold headings and bullet points.
Be warm, helpful, and actionable — never just acknowledge the problem without giving advice.
Never diagnose or prescribe medications. Always recommend seeing a doctor for serious symptoms.
If asked something unrelated to health, politely redirect to health topics.`;

// Fallback order — tries each model until one responds successfully
const MODELS = [
  'gemini-3.6-flash',
  'gemini-3.5-flash',
  'gemini-flash-latest',
  'gemini-3.7-flash',
  'gemini-3.8-flash',
];

async function tryStreamWithModel(apiKey: string, model: string, contents: any[]): Promise<Response | null> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;

  const geminiRes = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
  });

  // 429 = rate limit, 503 = overloaded → try next model
  if (geminiRes.status === 429 || geminiRes.status === 503) {
    console.log(`Model ${model} unavailable (${geminiRes.status}), trying next...`);
    return null;
  }

  if (!geminiRes.ok || !geminiRes.body) {
    const err = await geminiRes.json().catch(() => ({}));
    const msg = err?.error?.message || '';
    // If model not found or not available, try next
    if (geminiRes.status === 404 || msg.includes('not found') || msg.includes('no longer available')) {
      console.log(`Model ${model} not found, trying next...`);
      return null;
    }
    throw new Error(msg || `API error ${geminiRes.status}`);
  }

  // Stream text chunks back to client
  const stream = new ReadableStream({
    async start(controller) {
      const reader = geminiRes.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (!jsonStr || jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (text) controller.enqueue(new TextEncoder().encode(text));
          } catch { /* skip malformed chunks */ }
        }
      }
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      return new Response(JSON.stringify({ error: 'Gemini API key not configured.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const contents = [
      { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
      { role: 'model', parts: [{ text: "Understood! I'm MediCore's AI Health Assistant. How can I help you today?" }] },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      })),
    ];

    // Try each model in order until one works
    let lastError = 'All models are currently busy. Please try again in a moment.';
    for (const model of MODELS) {
      try {
        const result = await tryStreamWithModel(apiKey, model, contents);
        if (result) return result; // success — stream back to client
      } catch (err: any) {
        lastError = err.message || lastError;
        console.error(`Model ${model} threw error:`, err.message);
      }
    }

    return new Response(JSON.stringify({ error: lastError }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Failed to get AI response. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
