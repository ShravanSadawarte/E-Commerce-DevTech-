const { Message, Conversation, User } = require('../models');

const setupChatSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join room for specific conversation
    socket.on('join_conversation', ({ conversationId }) => {
      if (conversationId) {
        socket.join(`conversation_${conversationId}`);
        console.log(`[Socket] ${socket.id} joined conversation_${conversationId}`);
      }
    });

    // Join admin broadcast room
    socket.on('join_admin_channel', () => {
      socket.join('admin_chat_room');
      console.log(`[Socket] Admin joined admin_chat_room: ${socket.id}`);
    });

    // Handle new message from client/admin
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, senderId, senderType, senderName, message } = data;

        if (!conversationId || !message) return;

        const savedMessage = await Message.create({
          conversationId,
          senderId: senderId || 1,
          senderType: senderType || 'CUSTOMER',
          senderName: senderName || 'Guest User',
          message,
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
