const { Category, Product } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { status: true },
      order: [['name', 'ASC']],
    });
    return successResponse(res, { categories }, 'Categories fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await Category.findOne({
      where: { slug, status: true },
      include: [
        {
          model: Product,
          as: 'products',
          where: { status: true },
          limit: 12,
          required: false,
        },
      ],
    });

    if (!category) {
      return errorResponse(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    return successResponse(res, { category }, 'Category fetched successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
};
