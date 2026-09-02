const { Review, Product, User, Order, OrderItem } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const getProductReviews = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.findAll({
      where: { productId, isApproved: true },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'avatar'],
        },
      ],
      order: [['createdAt', 'DESC']],
    });

    return successResponse(res, { reviews }, 'Reviews fetched successfully');
  } catch (error) {
    next(error);
  }
};

const createReview = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      return errorResponse(res, 'Product ID, rating (1-5), and review comment are required.', 400, 'VALIDATION_ERROR');
    }

    if (rating < 1 || rating > 5) {
      return errorResponse(res, 'Rating must be between 1 and 5 stars.', 400, 'INVALID_RATING');
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return errorResponse(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // Check if user already reviewed this product
    let existingReview = await Review.findOne({ where: { userId, productId } });
    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();
    } else {
      existingReview = await Review.create({
        userId,
        productId,
        rating,
        comment,
        isApproved: true,
      });
    }

    // Recalculate average rating & review count on product
    const allReviews = await Review.findAll({ where: { productId, isApproved: true } });
    const count = allReviews.length;
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = count > 0 ? (totalRating / count).toFixed(2) : 0.00;

    product.rating = avgRating;
    product.reviewCount = count;
    await product.save();

    const reviewWithUser = await Review.findByPk(existingReview.id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
    });

    return successResponse(res, { review: reviewWithUser }, 'Review submitted successfully', 201);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProductReviews,
  createReview,
};
