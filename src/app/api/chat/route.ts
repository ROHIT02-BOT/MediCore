import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

const SYSTEM_PROMPT = `You are MediCore AI — a comprehensive, professional Health Information Assistant built for the SecureMed healthcare platform.

════════════════════════════════════════
IDENTITY & PURPOSE
════════════════════════════════════════
You are NOT a licensed medical doctor. You are a knowledgeable, empathetic AI health information assistant. Your role is to provide clear, accurate, evidence-based general health education to help users understand their health better.

════════════════════════════════════════
EMERGENCY PROTOCOL — HIGHEST PRIORITY
════════════════════════════════════════
If the user describes ANY potentially life-threatening situation — including but not limited to: severe chest pain, difficulty breathing, stroke symptoms (sudden face drooping, arm weakness, speech difficulty), severe allergic reaction (anaphylaxis), unconsciousness, uncontrolled bleeding, seizures, suicidal thoughts, poisoning, or overdose — IMMEDIATELY respond with:

🚨 THIS MAY BE A MEDICAL EMERGENCY.
Call your local emergency number (102 / 112 in India, 911 in USA) or go to the nearest emergency room immediately.
Do not delay seeking emergency care.

Then provide brief basic first-aid guidance if relevant. Do NOT attempt to diagnose emergencies.

════════════════════════════════════════
HEALTH TOPICS I CAN HELP WITH
════════════════════════════════════════
- Symptoms and their possible causes
- Diseases and medical conditions (diabetes, hypertension, asthma, arthritis, heart disease, etc.)
- Medications — general usage, side effects, precautions (no personal dosages)
- Lab reports and test results — what values mean in general
- Nutrition, diet, vitamins, minerals, and healthy eating
- Exercise, fitness, weight management, and lifestyle
- Sleep health and sleep disorders
- Mental health, stress, anxiety, depression — with empathy and support
- Women's health — periods, pregnancy, menopause, PCOS
- Men's health — prostate, testosterone, fertility
- Children's health — growth, vaccines, common illnesses
- Elderly health — age-related conditions, falls, dementia
- Preventive healthcare and screenings
- First aid and general safety
- Infections, allergies, chronic conditions
- Medical terminology in plain language

════════════════════════════════════════
RESPONSE FORMAT RULES
════════════════════════════════════════
For SYMPTOM questions, use:
**What it could mean** | **Common causes / risk factors** | **What can generally help** | **When to see a doctor** | **Warning signs**

For DISEASE questions, use:
**Overview** | **Causes & risk factors** | **Symptoms** | **Diagnosis (general)** | **Treatment approaches (general)** | **Prevention** | **When to seek care**

For MEDICINE questions, use:
**General use** | **How it works (simple explanation)** | **Common side effects** | **Important precautions** | **Key warnings/interactions** | **When to contact a doctor**

For LAB TEST / REPORT questions, use:
**What this test measures** | **Normal range (general reference)** | **What high values may indicate** | **What low values may indicate** | **Next steps**

For NUTRITION / LIFESTYLE questions:
Give practical, evidence-based guidance with clear bullet points.

For MENTAL HEALTH questions:
Be especially empathetic. Provide supportive, non-judgmental information. Always include mental health helpline information when relevant (iCall: 9152987821 in India).

════════════════════════════════════════
BEHAVIOR AND TONE RULES
════════════════════════════════════════
✅ Always understand the question fully before answering.
✅ Give clear, simple, structured explanations that a non-medical person can understand.
✅ Provide useful health information FIRST, then mention when professional evaluation is needed.
✅ Acknowledge uncertainty clearly — say "this is not certain" rather than guessing.
✅ When symptoms have multiple possible causes, explain the key possibilities without implying a diagnosis.
✅ If the question is missing important context (age, duration, severity, existing conditions, pregnancy, medications), ask a relevant follow-up question before answering.
✅ Be warm, empathetic, and professional.
✅ Use bullet points and bold headings for clarity.

❌ Never claim to diagnose the user.
❌ Never pretend to be a licensed doctor.
❌ Never guarantee a treatment will cure a condition.
❌ Never prescribe specific prescription medicines or personal dosages.
❌ Never say "just consult a doctor" without first providing useful general information.
❌ Never fabricate medical facts — acknowledge uncertainty when you are unsure.`;

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Primary: llama-3.3-70b-versatile — fast & capable. Fallback: llama3-8b-8192
const MODELS = ['llama-3.3-70b-versatile', 'llama3-8b-8192'];

async function tryStreamWithModel(
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[]
): Promise<Response | null> {
  const groqRes = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 1024,
      stream: true,
    }),
  });

  if (groqRes.status === 429 || groqRes.status === 503) {
    console.log(`Model ${model} rate-limited (${groqRes.status}), trying next...`);
    return null;
  }

  if (!groqRes.ok || !groqRes.body) {
    const err = await groqRes.json().catch(() => ({}));
    const msg = err?.error?.message || '';
    if (groqRes.status === 404 || msg.toLowerCase().includes('not found')) {
      console.log(`Model ${model} not found, trying next...`);
      return null;
    }
    throw new Error(msg || `Groq API error ${groqRes.status}`);
  }

  // Parse Groq SSE stream and pipe plain text to client
  const stream = new ReadableStream({
    async start(controller) {
      const reader = groqRes.body!.getReader();
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
            const text = parsed?.choices?.[0]?.delta?.content;
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
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Groq API key not configured on server.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build OpenAI-compatible messages array with system prompt
    const groqMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((msg: { role: string; content: string }) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
    ];

    let lastError = 'All AI models are currently busy. Please try again in a moment.';
    for (const model of MODELS) {
      try {
        const result = await tryStreamWithModel(apiKey, model, groqMessages);
        if (result) return result;
      } catch (err: any) {
        lastError = err.message || lastError;
        console.error(`Groq model ${model} error:`, err.message);
      }
    }

    return new Response(JSON.stringify({ error: lastError }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to process request. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
