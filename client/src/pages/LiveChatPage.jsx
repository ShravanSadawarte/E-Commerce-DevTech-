import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquare, Send, Shield, ChevronRight, Loader2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { getSocket } from '../services/socket';

const LiveChatPage = () => {
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      const load = async () => {
        try {
          const res = await api.get('/chat/conversation');
          setConversation(res.data?.conversation);
          setMessages(res.data?.conversation?.messages || []);

          const socket = getSocket();
          socket.emit('join_conversation', { conversationId: res.data?.conversation?.id });

          socket.on('receive_message', (msg) => {
            setMessages((prev) => [...prev, msg]);
          });
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await api.post('/chat/messages', {
        conversationId: conversation?.id,
        message: text,
      });

      const socket = getSocket();
      socket.emit('send_message', {
        conversationId: conversation?.id,
        senderId: user.id,
        senderType: 'CUSTOMER',
        senderName: user.name,
        message: text,
      });

      if (!messages.some((m) => m.id === res.data?.message?.id)) {
        setMessages((prev) => [...prev, res.data?.message]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <Sparkles className="w-12 h-12 text-blue-600 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Sign in to start live chat</h2>
        <p className="text-xs text-slate-500">
          Our advisors are online and ready to assist you.
        </p>
        <Link
          to="/login"
          className="inline-block bg-slate-900 text-white text-xs font-bold px-6 py-3 rounded-full uppercase"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-500">
        <Link to="/" className="hover:text-slate-900 transition">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="font-bold text-slate-900">Live Concierge Support</span>
      </nav>

      {/* Main Chat Box */}
      <div className="bg-white rounded-3xl border border-slate-200 card-shadow overflow-hidden flex flex-col h-[650px]">
        {/* Chat Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold">Chat with us</h2>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>DevTech Support Team Online</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-slate-50/60">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : (
            <>
              {messages.map((msg, index) => {
                const isUser = msg.senderType === 'CUSTOMER' || msg.senderId === user?.id;
                return (
                  <div
                    key={msg.id || index}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-slate-400 mb-1 px-1 font-semibold">
                      {isUser ? 'You' : msg.senderName || 'DevTech Agent'}
                    </span>
                    <div
                      className={`max-w-[75%] rounded-3xl px-4 py-3 text-xs leading-relaxed shadow-xs ${
                        isUser
                          ? 'bg-slate-900 text-white rounded-br-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200 flex gap-3 items-center">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-slate-100 border border-slate-200 text-slate-900 rounded-2xl px-4 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || sending}
            className="bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white p-3 rounded-2xl shadow-md transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default LiveChatPage;
