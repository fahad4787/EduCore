const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const buildContents = (history, message) => {
  const contents = [];
  (history || []).slice(-10).forEach((item) => {
    contents.push({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: item.content }],
    });
  });
  contents.push({ role: 'user', parts: [{ text: message }] });
  return contents;
};

const callGemini = async ({ systemPrompt, history, message }) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured. Add it to backend/.env');
  }

  const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: buildContents(history, message),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const errMsg = data?.error?.message || 'AI service request failed';
    throw new Error(errMsg);
  }

  const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!reply) {
    throw new Error('No response from AI. Try again.');
  }

  return reply.trim();
};

module.exports = { callGemini };
