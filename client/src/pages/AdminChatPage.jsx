import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquare, Send, User, Shield, Loader2 } from 'lucide-react';
import api from '../services/api';
import { getSocket } from '../services/socket';

const AdminChatPage = () => {
  const { user } = useSelector((state) => state.auth);

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const loadConversations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/conversations');
      setConversations(res.data?.conversations || []);
      if (res.data?.conversations?.length > 0 && !activeConversationId) {
        setActiveConversationId(res.data.conversations[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();

    const socket = getSocket();
    socket.emit('join_admin_channel');

    socket.on('new_customer_message', ({ conversationId, message }) => {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === conversationId ? { ...c, lastMessage: message.message, lastMessageAt: new Date() } : c
        )
      );
      if (activeConversationId === conversationId) {
        setMessages((prev) => [...prev, message]);
      }
    });
  }, [activeConversationId]);

  useEffect(() => {
    if (activeConversationId) {
      const loadMessages = async () => {
        try {
          const res = await api.get(`/admin/conversations/${activeConversationId}`);
          setMessages(res.data?.conversation?.messages || []);

          const socket = getSocket();
          socket.emit('join_conversation', { conversationId: activeConversationId });
        } catch (e) {
          console.error(e);
        }
      };
      loadMessages();
    }
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversationId || sending) return;

    const text = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const res = await api.post(`/admin/conversations/${activeConversationId}/messages`, {
        message: text,
      });

      const socket = getSocket();
      socket.emit('send_message', {
        conversationId: activeConversationId,
        senderId: user.id,
        senderType: 'ADMIN',
        senderName: user.name || 'DevTech Support',
        message: text,
      });

      if (!messages.some((m) => m.id === res.data?.message?.id)) {
        setMessages((prev) => [...prev, res.data?.message]);
      }
    } catch (e) {
      alert('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 card-shadow overflow-hidden flex h-[650px]">
      {/* Left List of Customer Conversations */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/40">
        <div className="p-4 border-b border-slate-200 bg-white">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
            Active Chats ({conversations.length})
          </h3>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversations.map((conv) => {
            const isSelected = conv.id === activeConversationId;
            return (
              <div
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`p-4 cursor-pointer transition flex items-center gap-3 ${
                  isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-100/60'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                  <User className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{conv.userName || `User #${conv.userId}`}</h4>
                  <p className="text-[11px] text-slate-500 truncate">{conv.lastMessage || 'No messages yet'}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Messages Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConv ? (
          <>
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900">{activeConv.userName || `Customer #${activeConv.userId}`}</h4>
                <p className="text-[10px] text-slate-500">Live Support Dialogue</p>
              </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto space-y-3 bg-slate-50/20">
              {messages.map((msg, index) => {
                const isAdminMsg = msg.senderType === 'ADMIN';
                return (
                  <div
                    key={msg.id || index}
                    className={`flex flex-col ${isAdminMsg ? 'items-end' : 'items-start'}`}
                  >
                    <span className="text-[10px] text-slate-400 mb-0.5 px-1 font-semibold">
                      {isAdminMsg ? 'You (Staff)' : msg.senderName || 'Customer'}
                    </span>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-xs ${
                        isAdminMsg
                          ? 'bg-blue-600 text-white rounded-br-xs'
                          : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendReply} className="p-4 border-t border-slate-200 flex gap-2">
              <input
                type="text"
                placeholder="Type reply to customer..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-slate-900"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-xs transition"
              >
                Reply
              </button>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400 text-xs">
            Select a customer conversation to respond.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminChatPage;
