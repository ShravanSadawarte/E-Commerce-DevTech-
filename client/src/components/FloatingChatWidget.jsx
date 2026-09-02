import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { MessageSquare, X, Send, User, Shield, Sparkles, Loader2 } from 'lucide-react';
import { setFloatingChatOpen } from '../store/uiSlice';
import api from '../services/api';
import { getSocket } from '../services/socket';

const FloatingChatWidget = () => {
  const dispatch = useDispatch();
  const { floatingChatOpen } = useSelector((state) => state.ui);
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversation when widget is opened
  useEffect(() => {
    if (floatingChatOpen && isAuthenticated) {
      const loadChat = async () => {
        setLoading(true);
        try {
          const res = await api.get('/chat/conversation');
          setConversation(res.data?.conversation);
          setMessages(res.data?.conversation?.messages || []);

          // Join Socket.io room
          const socket = getSocket();
          socket.emit('join_conversation', { conversationId: res.data?.conversation?.id });

          socket.on('receive_message', (newMsg) => {
            setMessages((prev) => [...prev, newMsg]);
          });
        } catch (e) {
          console.error('Chat load error:', e);
        } finally {
          setLoading(false);
        }
      };

      loadChat();
    }
  }, [floatingChatOpen, isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    const messageText = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await api.post('/chat/messages', {
        conversationId: conversation?.id,
        message: messageText,
      });

      const socket = getSocket();
      socket.emit('send_message', {
        conversationId: conversation?.id,
        senderId: user.id,
        senderType: 'CUSTOMER',
        senderName: user.name,
        message: messageText,
      });

      // Avoid double add if socket already received
      if (!messages.some((m) => m.id === res.data?.message?.id)) {
        setMessages((prev) => [...prev, res.data?.message]);
      }
    } catch (e) {
      console.error('Failed to send message:', e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!floatingChatOpen && (
        <button
          onClick={() => dispatch(setFloatingChatOpen(true))}
          className="bg-slate-900 hover:bg-slate-800 text-white p-3.5 rounded-full shadow-2xl flex items-center gap-2.5 transition-all duration-300 hover:scale-105 border-2 border-white"
          aria-label="Open Live Chat"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-xs font-bold tracking-wide pr-1">Chat with us</span>
        </button>
      )}

      {/* Expanded Chat Box */}
      {floatingChatOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
          {/* Header */}
          <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold leading-tight">DevTech Support</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online • Immediate response</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => dispatch(setFloatingChatOpen(false))}
              className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
            {!isAuthenticated ? (
              <div className="text-center py-10 px-4">
                <Sparkles className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h5 className="text-sm font-bold text-slate-900 mb-1">Live Concierge Chat</h5>
                <p className="text-xs text-slate-500 mb-4">Please log in to chat in real-time with our support advisors.</p>
                <a
                  href="/login"
                  className="inline-block bg-slate-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs"
                >
                  Sign In to Chat
                </a>
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
              </div>
            ) : (
              <>
                <div className="text-center my-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-200/60 px-2.5 py-1 rounded-full">
                    Conversation Started
                  </span>
                </div>

                {messages.map((msg, index) => {
                  const isUser = msg.senderType === 'CUSTOMER' || msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id || index}
                      className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                    >
                      <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-medium">
                        {isUser ? 'You' : msg.senderName || 'DevTech Agent'}
                      </span>
                      <div
                        className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed shadow-xs ${
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

          {/* Input Box */}
          {isAuthenticated && (
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex gap-2 items-center">
              <input
                type="text"
                placeholder="Type your message..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-100 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="bg-slate-900 text-white p-2.5 rounded-xl hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default FloatingChatWidget;
