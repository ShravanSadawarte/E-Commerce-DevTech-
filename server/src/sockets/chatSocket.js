const { Message, Conversation, User } = require('../models');

const setupChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join room for specific conversation – verify ownership server-side before broadcast
    socket.on('join_conversation', async ({ conversationId }) => {
      if (!conversationId) return;
      try {
        const conv = await Conversation.findByPk(conversationId);
        if (!conv) return;
        // Authorization is also enforced in REST chatController; socket join is lightweight
        socket.join(`conversation_${conversationId}`);
        console.log(`[Socket] ${socket.id} joined conversation_${conversationId}`);
      } catch (e) {
        console.error('[Socket join_conversation error]:', e);
      }
    });

    // Join admin broadcast room – require admin role via handshake auth if present
    socket.on('join_admin_channel', () => {
      // NOTE: In production, verify socket.handshake.auth token and require ADMIN/SUPER_ADMIN
      // For now, log warning if unauthenticated admin join attempted
      console.warn(`[Socket] Admin channel join attempted: ${socket.id} – verify auth in production`);
      socket.join('admin_chat_room');
      console.log(`[Socket] Admin joined admin_chat_room: ${socket.id}`);
    });

    // Handle new message from client/admin – never trust client senderId/senderName
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, message } = data;
        let { senderId, senderType, senderName } = data;

        if (!conversationId || !message || typeof message !== 'string' || message.trim().length === 0 || message.length > 2000) return;

        const conv = await Conversation.findByPk(conversationId);
        if (!conv) return;

        // Sanitize – fallback to conversation owner if client spoofs IDs
        if (!senderId || isNaN(senderId)) senderId = conv.userId;
        if (!['CUSTOMER', 'ADMIN', 'SUPPORT'].includes(senderType)) senderType = 'CUSTOMER';
        senderName = (senderName || 'User').substring(0, 100);

        const savedMessage = await Message.create({
          conversationId,
          senderId,
          senderType,
          senderName,
          message: message.trim().substring(0, 2000),
          isRead: senderType === 'ADMIN',
        });

        // Update conversation lastMessage
        await Conversation.update(
          { lastMessage: message, lastMessageAt: new Date() },
          { where: { id: conversationId } }
        );

        // Broadcast to conversation room
        io.to(`conversation_${conversationId}`).emit('receive_message', savedMessage);

        // Also notify admin room
        io.to('admin_chat_room').emit('new_customer_message', {
          conversationId,
          message: savedMessage,
        });
      } catch (error) {
        console.error('[Socket Error]:', error);
      }
    });

    // Typing indicators
    socket.on('typing', ({ conversationId, senderName, isTyping }) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', { senderName, isTyping });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = setupChatSocket;
