const { ContactMessage } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const submitContactMessage = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return errorResponse(res, 'Name, email, and message are required.', 400, 'VALIDATION_ERROR');
    }

    const contact = await ContactMessage.create({
      userId,
      name,
      email,
      subject: subject || 'Customer Inquiry',
      message,
      status: 'NEW',
    });

    return successResponse(res, { contact }, 'Message sent successfully. Our support team will get back to you soon.', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  submitContactMessage,
};
