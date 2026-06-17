import React, { useState, useRef, useEffect, useContext } from 'react';
import axios from 'axios';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AI_SUGGESTIONS } from '../constants/aiSuggestions';
import './AiChat.css';

const AiChat = () => {
  const { user } = useContext(AuthContext);
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const suggestions = AI_SUGGESTIONS[user?.role] || [];

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [open, messages, loading]);

  const sendMessage = async (text) => {
    const trimmed = text?.trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/ai/chat`, {
        message: trimmed,
        history,
      });
      setMessages([...nextMessages, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      const errText = err.response?.data?.message || 'AI assistant unavailable';
      showToast(errText, 'error');
      setMessages([...nextMessages, { role: 'assistant', content: `Sorry, I couldn't respond: ${errText}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  if (!user) return null;

  return (
    <>
      <button
        className={`ai-chat-fab${open ? ' open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
        aria-label="EduCore AI Assistant"
      >
        {open ? <X size={22} /> : <MessageCircle size={24} />}
      </button>

      {open && (
        <div className="ai-chat-panel">
          <div className="ai-chat-header">
            <div className="ai-chat-header-info">
              <div className="ai-chat-header-icon">AI</div>
              <div>
                <h4>EduCore Assistant</h4>
                <p>{user.role} · Powered by OpenAI</p>
              </div>
            </div>
            <button className="ai-chat-close" onClick={() => setOpen(false)} aria-label="Close chat">
              <X size={18} />
            </button>
          </div>

          <div className="ai-chat-messages">
            {messages.length === 0 && (
              <div className="ai-chat-welcome">
                <Sparkles size={28} color="var(--accent-primary)" style={{ marginBottom: '0.5rem' }} />
                <p>Hi {user.name?.split(' ')[0]}, I'm your EduCore AI assistant. Ask me about your {user.role.toLowerCase()} data, attendance, leaves, notices, courses, and more.</p>
                <div className="ai-chat-suggestions">
                  {suggestions.map((q) => (
                    <button key={q} className="ai-chat-suggestion" onClick={() => sendMessage(q)}>
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} className={`ai-chat-bubble ${msg.role}`}>
                {msg.content}
              </div>
            ))}

            {loading && (
              <div className="ai-chat-typing">
                <span className="loader-spinner sm" />
                Thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="ai-chat-input-area" onSubmit={handleSubmit}>
            <textarea
              ref={inputRef}
              className="ai-chat-input"
              rows={1}
              placeholder="Ask EduCore AI..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button type="submit" className="ai-chat-send" disabled={loading || !input.trim()}>
              <Send size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default AiChat;
