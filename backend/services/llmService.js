const callOpenAI = async ({ systemPrompt, history, message }) => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey.includes('your_')) {
    throw new Error('OPENAI_API_KEY is not configured. Add it to backend/.env or Render environment variables.');
  }

  const messages = [
    { role: 'system', content: systemPrompt },
    ...(history || []).slice(-6).map((h) => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: h.content,
    })),
    { role: 'user', content: message },
  ];

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages,
      temperature: 0.7,
      max_tokens: 800,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    const errMsg = data?.error?.message || 'OpenAI request failed';
    throw new Error(errMsg);
  }

  const reply = data?.choices?.[0]?.message?.content?.trim();
  if (!reply) throw new Error('OpenAI returned an empty response');
  return reply;
};

const callLLM = async ({ systemPrompt, history, message }) => {
  const reply = await callOpenAI({ systemPrompt, history, message });
  return { reply, provider: 'openai' };
};

module.exports = { callLLM };
