const { Testimonial } = require('../models');
const { successResponse } = require('../utils/responseHandler');

const getTestimonials = async (req, res, next) => {
  try {
    const testimonials = await Testimonial.findAll({
      where: { isFeatured: true },
      order: [['rating', 'DESC'], ['createdAt', 'DESC']],
    });
    return successResponse(res, { testimonials }, 'Testimonials retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTestimonials,
};
