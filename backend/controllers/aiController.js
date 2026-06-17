const { buildContextForUser } = require('../services/aiContextService');
const { callLLM } = require('../services/llmService');

const SYSTEM_RULES = `You are EduCore AI, the intelligent assistant inside the EduCore University Management System.

Rules:
- Answer only about EduCore, university operations, and the user's data provided below.
- Use the live database context to give accurate, specific answers with names and numbers when available.
- Be concise, friendly, and professional. Use bullet points for lists.
- If asked about data not in context, say you don't have that information and suggest which EduCore page to check.
- Never reveal passwords, JWT tokens, or other users' private details beyond what the role is allowed to see.
- For Admin: you can discuss all students, professors, courses, subjects, leaves, notices.
- For Professor: only discuss their assigned courses, their students, their materials, and leaves from their students.
- For Student: only discuss their own attendance, leaves, notices, subjects, and materials.
- You can explain how to use EduCore features (how to apply leave, upload material, mark attendance, etc.).
- Keep responses under 200 words unless the user asks for detail.`;

const chat = async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: 'Message is required' });
    }

    const context = await buildContextForUser(req.user);
    const systemPrompt = `${SYSTEM_RULES}\n\n${context}`;

    const { reply } = await callLLM({
      systemPrompt,
      history: history || [],
      message: message.trim(),
    });

    res.json({ reply });
  } catch (error) {
    console.error('AI chat error:', error.message);
    res.status(500).json({ message: error.message || 'AI chat failed' });
  }
};

module.exports = { chat };
