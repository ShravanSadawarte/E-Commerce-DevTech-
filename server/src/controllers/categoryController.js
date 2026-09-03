const { Category, Product } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const buildTree = (flat, parentId = null) => {
  return flat
    .filter((c) => (c.parentId === parentId || (c.parentId == null && parentId == null)))
    .sort((a, b) => (a.sortOrder - b.sortOrder) || a.name.localeCompare(b.name))
    .map((c) => ({
      ...c.toJSON(),
      children: buildTree(flat, c.id),
    }));
};

const getCategories = async (req, res, next) => {
  try {
    const { flat } = req.query;
    const categories = await Category.findAll({
      where: { status: true },
      order: [['sortOrder', 'ASC'], ['name', 'ASC']],
      include: [{ model: Category, as: 'children', attributes: ['id'] }],
    });

    // flat=true preserves old behavior for backward compat (admin list)
    if (flat === 'true') {
      return successResponse(res, { categories }, 'Categories fetched successfully');
    }

    // hierarchical tree
    const tree = buildTree(categories);
    return successResponse(res, { categories: tree }, 'Categories fetched successfully');
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
        { model: Category, as: 'children', where: { status: true }, required: false, order: [['sortOrder', 'ASC']] },
        { model: Category, as: 'parent', attributes: ['id', 'name', 'slug'] },
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

    // breadcrumb: walk up parents
    const breadcrumb = [];
    let cur = category;
    while (cur) {
      breadcrumb.unshift({ id: cur.id, name: cur.name, slug: cur.slug });
      if (cur.parent) cur = await Category.findByPk(cur.parent.id, { include: [{ model: Category, as: 'parent', attributes: ['id','name','slug'] }] });
      else if (cur.parentId) cur = await Category.findByPk(cur.parentId, { attributes: ['id','name','slug','parentId'] });
      else cur = null;
      if (breadcrumb.length > 5) break; // safety
    }

    const json = category.toJSON();
    json.breadcrumb = breadcrumb;
    return successResponse(res, { category: json }, 'Category fetched successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryBySlug,
};
