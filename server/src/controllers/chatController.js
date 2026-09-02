const { Conversation, Message, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const getOrCreateConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let conversation = await Conversation.findOne({
      where: { userId },
      include: [
        {
          model: Message,
          as: 'messages',
          order: [['createdAt', 'ASC']],
        },
      ],
    });

    if (!conversation) {
      conversation = await Conversation.create({
        userId,
        userName: req.user.name,
        status: 'OPEN',
        lastMessage: 'Hello! How can we assist you today?',
      });

      // Add welcoming bot / agent greeting
      await Message.create({
        conversationId: conversation.id,
        senderId: 1, // Admin / Bot ID
        senderType: 'ADMIN',
        senderName: 'DevTech Support',
        message: 'Hello! Welcome to DevTech Support. How can we help you today?',
        isRead: false,
      });

      conversation = await Conversation.findByPk(conversation.id, {
        include: [{ model: Message, as: 'messages' }],
      });
    }

    return successResponse(res, { conversation }, 'Conversation loaded successfully');
  } catch (error) {
    next(error);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { conversationId, message } = req.body;

    if (!message || !message.trim()) {
      return errorResponse(res, 'Message text is required.', 400, 'VALIDATION_ERROR');
    }

    let conversation;
    if (conversationId) {
      conversation = await Conversation.findByPk(conversationId);
    } else {
      conversation = await Conversation.findOne({ where: { userId } });
    }

    if (!conversation) {
      conversation = await Conversation.create({
        userId,
        userName: req.user.name,
        status: 'OPEN',
      });
    }

    const newMessage = await Message.create({
      conversationId: conversation.id,
      senderId: userId,
      senderType: 'CUSTOMER',
      senderName: req.user.name,
      message: message.trim(),
      isRead: false,
    });

    conversation.lastMessage = message.trim();
    conversation.lastMessageAt = new Date();
    await conversation.save();

    return successResponse(res, { message: newMessage }, 'Message sent successfully', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOrCreateConversation,
  sendMessage,
};
