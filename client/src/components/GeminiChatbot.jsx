import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2, Trash2, MessageCircle } from 'lucide-react';
import api from '../services/api';

const STORAGE_KEY = 'nexora_gemini_chat';
const SUGGESTIONS = [
  'Show me best sellers under $100',
  'What are the shipping charges?',
  'Suggest a gift for mens wear',
  'How to track my order?',
];

const GeminiChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [
        { role: 'model', content: 'Hi! I\'m NEXORA Assistant — your AI shopping concierge. Ask me about products, sizes, orders, or style advice! ✨' }
      ];
    } catch { return [{ role: 'model', content: 'Hi! I\'m NEXORA Assistant — your AI shopping concierge. Ask me about products, sizes, orders, or style advice! ✨' }]; }
  });
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const listRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30))); } catch {}
  }, [messages]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  const send = async (textOverride) => {
    const text = (textOverride ?? input).trim();
    if (!text || sending) return;
    if (text.length > 1000) { setError('Message too long (max 1000 chars)'); return; }
    setError('');
    const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', content: m.content }));
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setSending(true);
    try {
      const res = await api.post('/gemini/chat', { message: text, history: history.slice(-10) });
      const reply = res.data?.reply || res.reply || 'Sorry, no reply.';
      setMessages(prev => [...prev, { role: 'model', content: reply }]);
    } catch (e) {
      const msg = e.message || e.error || 'AI unavailable, try again.';
      if (e.errorCode === 'SERVICE_UNAVAILABLE' || msg.includes('not configured')) {
        setMessages(prev => [...prev, { role: 'model', content: '⚠️ AI not configured. Admin: set GEMINI_API_KEY in server/.env and Vercel env.' }]);
      } else if (e.statusCode === 429) {
        setMessages(prev => [...prev, { role: 'model', content: '⏳ AI is busy, please wait a moment and try again.' }]);
      } else {
        setMessages(prev => [...prev, { role: 'model', content: `❌ ${msg}` }]);
      }
    } finally { setSending(false); }
  };

  const clearChat = () => {
    const init = [{ role: 'model', content: "Hi! I'm NEXORA Assistant — your AI shopping concierge. Ask me about products, sizes, orders, or style advice! ✨" }];
    setMessages(init);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <>
      {/* Toggle Button - bottom-left so it doesn't overlap existing Support widget (bottom-right) */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 left-6 z-50 bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2.5 border-2 border-white transition-all hover:scale-105"
          aria-label="Open AI Assistant"
        >
          <Bot className="w-5 h-5" />
          <span className="hidden sm:inline text-xs font-bold tracking-wide pr-1">AI Assistant</span>
          <Sparkles className="w-3.5 h-3.5 opacity-80 hidden sm:block" />
        </button>
      )}

      {/* Chat Window - Responsive: full-screen on mobile, card on desktop */}
      {open && (
        <div className="fixed inset-0 sm:inset-auto sm:bottom-6 sm:left-6 z-50 flex flex-col">
          {/* Mobile backdrop */}
          <div className="absolute inset-0 bg-slate-900/40 sm:hidden backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative mt-auto sm:mt-0 w-full sm:w-[380px] md:w-[400px] h-[100dvh] sm:h-[560px] sm:max-h-[78vh] bg-white sm:rounded-3xl rounded-t-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-3.5 sm:p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold leading-tight flex items-center gap-1.5">NEXORA AI <Sparkles className="w-3 h-3 opacity-80" /></h4>
                  <p className="text-[11px] text-violet-100 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Gemini 1.5 Flash • Online
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={clearChat} title="Clear chat" className="p-2 rounded-full hover:bg-white/15 text-white/80 hover:text-white transition">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setOpen(false)} className="p-2 rounded-full hover:bg-white/15 text-white transition">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
              <div className="px-3 py-2.5 bg-violet-50/70 border-b border-violet-100 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)} className="shrink-0 text-[11px] font-medium bg-white border border-violet-200 text-violet-700 px-3 py-1.5 rounded-full hover:bg-violet-600 hover:text-white hover:border-violet-600 transition">
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 bg-slate-50/50">
              {messages.map((m, i) => {
                const isUser = m.role === 'user';
                return (
                  <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${isUser ? 'bg-slate-900 text-white rounded-br-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'}`}>
                      <p className="whitespace-pre-wrap break-words">{m.content}</p>
                    </div>
                  </div>
                );
              })}
              {sending && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-sm px-3.5 py-2.5 flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Thinking...
                  </div>
                </div>
              )}
              {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
            </div>

            {/* Input */}
            <form onSubmit={(e) => { e.preventDefault(); send(); }} className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center shrink-0">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about products, orders..."
                maxLength={1000}
                className="flex-1 bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-violet-600 focus:bg-white transition"
              />
              <button type="submit" disabled={!input.trim() || sending} className="bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white p-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition shadow">
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Mobile drag handle */}
            <div className="sm:hidden flex justify-center py-1.5 bg-white border-t border-slate-100">
              <span className="w-10 h-1.5 rounded-full bg-slate-200" />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GeminiChatbot;
