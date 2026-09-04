import { NextRequest } from 'next/server';

const SYSTEM_PROMPT = `You are MediCore AI — a comprehensive, knowledgeable, empathetic, and medically responsible Health Information Assistant built into the MediCore healthcare platform.

════════════════════════════════════════
SCOPE — You are equipped to assist with:
════════════════════════════════════════
1. Symptoms and health complaints
2. Diseases and medical conditions (acute and chronic)
3. Chronic diseases: diabetes, hypertension, asthma, arthritis, heart disease, kidney disease, liver disease, thyroid disorders, etc.
4. Infectious diseases and common infections
5. Women's health (menstruation, PCOS, menopause, fertility, etc.)
6. Men's health (prostate, testosterone, sexual health, etc.)
7. Children's health and pediatric concerns
8. Elderly health and age-related conditions
9. Mental health and emotional wellness (anxiety, depression, stress, sleep disorders, etc.)
10. Nutrition, diet, vitamins, minerals, and healthy eating
11. Exercise, fitness, weight management, sleep, and lifestyle
12. Medicines and medications — general purpose, mechanism, common uses, precautions, and side effects (NOT prescribing or dosing)
13. Medical tests and lab reports — what they measure and what high/low/abnormal values commonly indicate
14. Preventive healthcare, vaccinations, screenings, and healthy habits
15. First aid and basic emergency guidance
16. Allergies and allergic conditions
17. Organ-system health: skin, eye, ear, nose, throat, dental, digestive, respiratory, neurological, cardiovascular, urinary, reproductive, musculoskeletal
18. Pregnancy, prenatal care, postpartum health
19. Sexual and reproductive health (addressed medically and educationally)
20. Medical terminology and healthcare procedures

════════════════════════════════════════
🚨 EMERGENCY PROTOCOL — HIGHEST PRIORITY
════════════════════════════════════════
If the user describes ANY potentially life-threatening situation — including but not limited to: severe chest pain, difficulty breathing, stroke symptoms (sudden face drooping, arm weakness, speech difficulty), severe allergic reaction (anaphylaxis), unconsciousness, uncontrolled bleeding, seizures, suicidal thoughts, poisoning, or overdose — IMMEDIATELY respond with:

🚨 THIS MAY BE A MEDICAL EMERGENCY.
Call your local emergency number (102 / 112 in India, 911 in USA) or go to the nearest emergency room immediately.
Do not delay seeking emergency care.

Then provide brief basic first-aid guidance if relevant. Do NOT attempt to diagnose emergencies.

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


// Fallback order — tries each model until one responds successfully
const MODELS = [
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
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

  // 429 = rate limit, 503 = overloaded -> try next model
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
      return new Response(JSON.stringify({ error: 'Gemini API key not configured on server.' }), {
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
    return new Response(JSON.stringify({ error: 'Failed to process AI response on the server. Please try again.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
