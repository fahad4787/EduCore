const GEMINI_MODELS = [
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-2.0-flash',
];

const buildGeminiContents = (history, message) => {
  const contents = [];
  (history || []).slice(-6).forEach((item) => {
    contents.push({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: item.content }],
    });
  });
  contents.push({ role: 'user', parts: [{ text: message }] });
  return contents;
};

const callGemini = async ({ systemPrompt, history, message, model }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.includes('your_')) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: buildGeminiContents(history, message),
      generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const errMsg = data?.error?.message || `Gemini ${model} failed`;
    throw new Error(errMsg);
  }

  return data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
};

const callGroq = async ({ systemPrompt, history, message }) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey.includes('your_')) return null;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(history || []).slice(-6).map((h) => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content,
    })),
    { role: 'user', content: message },
  ];

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages,
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const errMsg = data?.error?.message || 'Groq request failed';
    throw new Error(errMsg);
  }

  return data?.choices?.[0]?.message?.content?.trim() || null;
};

const isQuotaError = (msg) => /quota|rate.limit|limit:\s*0|exceeded/i.test(msg || '');

const callLLM = async ({ systemPrompt, history, message }) => {
  const providers = (process.env.LLM_PROVIDERS || 'groq,gemini').split(',').map((p) => p.trim());
  const errors = [];

  for (const provider of providers) {
    if (provider === 'groq') {
      try {
        const reply = await callGroq({ systemPrompt, history, message });
        if (reply) return { reply, provider: 'groq' };
      } catch (err) {
        errors.push(`Groq: ${err.message}`);
        if (!isQuotaError(err.message)) continue;
      }
    }

    if (provider === 'gemini') {
      for (const model of GEMINI_MODELS) {
        try {
          const reply = await callGemini({ systemPrompt, history, message, model });
          if (reply) return { reply, provider: `gemini:${model}` };
        } catch (err) {
          errors.push(`${model}: ${err.message}`);
          if (!isQuotaError(err.message)) break;
        }
      }
    }
  }

  const hasKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
  if (!hasKey) {
    throw new Error('No AI API key configured. Add GROQ_API_KEY to backend/.env (free at console.groq.com)');
  }

  throw new Error(
    errors[0]?.includes('quota') || errors.some((e) => isQuotaError(e))
      ? 'AI free quota reached. Add a GROQ_API_KEY (free at console.groq.com) to backend/.env and restart the server.'
      : errors.join(' | ') || 'All AI providers failed'
  );
};

module.exports = { callLLM };
