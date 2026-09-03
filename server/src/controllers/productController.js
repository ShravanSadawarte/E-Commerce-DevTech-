const { Op } = require('sequelize');
const { Product, Category, Brand, ProductImage, ProductVariant, Review, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 12;
    const offset = (page - 1) * limit;

    const {
      category,
      brand,
      minPrice,
      maxPrice,
      rating,
      sort,
      search,
      featured,
      inStock,
      size,
      color,
    } = req.query;

    const where = { status: true };

    // Category filter by slug or ID — includes descendants (hierarchical)
    const getDescendantIds = async (rootId) => {
      const all = await Category.findAll({ attributes: ['id', 'parentId'], raw: true });
      const ids = [rootId];
      const stack = [rootId];
      while (stack.length) {
        const pid = stack.pop();
        const children = all.filter((c) => c.parentId === pid);
        for (const ch of children) { ids.push(ch.id); stack.push(ch.id); }
      }
      return ids;
    };

    if (category) {
      let categoryIds = null;
      if (!isNaN(category)) {
        const cat = await Category.findByPk(parseInt(category, 10));
        if (!cat) {
          return successResponse(res, { products: [], pagination: { total: 0, page, limit, totalPages: 0, hasNext: false, hasPrev: false } });
        }
        categoryIds = await getDescendantIds(cat.id);
      } else {
        const cat = await Category.findOne({ where: { slug: category } });
        if (cat) {
          categoryIds = await getDescendantIds(cat.id);
        } else {
          // try search by category name fallback (for search "sneakers" etc.)
          return successResponse(res, { products: [], pagination: { total: 0, page, limit, totalPages: 0, hasNext: false, hasPrev: false } });
        }
      }
      if (categoryIds) where.categoryId = { [Op.in]: categoryIds };
    }

    // Brand filter
    if (brand) {
      const brandsArray = Array.isArray(brand) ? brand : brand.split(',');
      const brandRecords = await Brand.findAll({
        where: {
          [Op.or]: [
            { id: { [Op.in]: brandsArray.filter(b => !isNaN(b)) } },
            { name: { [Op.in]: brandsArray } },
            { slug: { [Op.in]: brandsArray } },
          ],
        },
      });
      if (brandRecords.length > 0) {
        where.brandId = { [Op.in]: brandRecords.map(b => b.id) };
      }
    }

    // Price filter
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }

    // Rating filter
    if (rating) {
      where.rating = { [Op.gte]: parseFloat(rating) };
    }

    // Featured filter
    if (featured === 'true' || featured === true) {
      where.isFeatured = true;
    }

    // In Stock filter
    if (inStock === 'true' || inStock === true) {
      where.stock = { [Op.gt]: 0 };
    }

    // Search query – escape LIKE wildcards to prevent pattern injection
    // Search across product name/description + brand + category (including descendants)
    if (search) {
      const escaped = search.replace(/[%_\\]/g, '\\$&').substring(0, 100);
      const like = `%${escaped}%`;
      const orConditions = [
        { name: { [Op.like]: like } },
        { description: { [Op.like]: like } },
        { shortDescription: { [Op.like]: like } },
      ];

      // Brand match
      const brandMatches = await Brand.findAll({
        where: { [Op.or]: [{ name: { [Op.like]: like } }, { slug: { [Op.like]: like } }] },
        attributes: ['id'],
        raw: true,
      });
      if (brandMatches.length) orConditions.push({ brandId: { [Op.in]: brandMatches.map((b) => b.id) } });

      // Category match (including descendants)
      const catMatches = await Category.findAll({
        where: { [Op.or]: [{ name: { [Op.like]: like } }, { slug: { [Op.like]: like } }] },
        attributes: ['id', 'parentId'],
        raw: true,
      });
      if (catMatches.length) {
        const allCats = await Category.findAll({ attributes: ['id', 'parentId'], raw: true });
        const catIds = new Set();
        const collect = (rootId) => {
          catIds.add(rootId);
          allCats.filter((c) => c.parentId === rootId).forEach((ch) => collect(ch.id));
        };
        catMatches.forEach((cm) => collect(cm.id));
        orConditions.push({ categoryId: { [Op.in]: [...catIds] } });
      }

      // Preserve existing category filter AND search OR
      // If where already has categoryId from ?category, combine via Op.and
      if (where.categoryId) {
        const existingCat = where.categoryId;
        delete where.categoryId;
        where[Op.and] = [{ categoryId: existingCat }, { [Op.or]: orConditions }];
      } else {
        where[Op.or] = orConditions;
      }
    }

    // Sorting
    let order = [['createdAt', 'DESC']];
    if (sort === 'price-asc') {
      order = [['price', 'ASC']];
    } else if (sort === 'price-desc') {
      order = [['price', 'DESC']];
    } else if (sort === 'rating') {
      order = [['rating', 'DESC']];
    } else if (sort === 'newest') {
      order = [['createdAt', 'DESC']];
    } else if (sort === 'popularity') {
      order = [['reviewCount', 'DESC'], ['rating', 'DESC']];
    }

    // Variant filtering (size / color)
    const variantWhere = {};
    if (size) variantWhere.size = size;
    if (color) variantWhere.color = color;

    const include = [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'slug'],
      },
      {
        model: Brand,
        as: 'brand',
        attributes: ['id', 'name', 'slug', 'logo'],
      },
      {
        model: ProductImage,
        as: 'images',
        attributes: ['id', 'imageUrl', 'altText', 'isPrimary', 'sortOrder'],
      },
      {
        model: ProductVariant,
        as: 'variants',
        where: Object.keys(variantWhere).length > 0 ? variantWhere : undefined,
        required: Object.keys(variantWhere).length > 0,
      },
    ];

    const { count, rows } = await Product.findAndCountAll({
      where,
      include,
      order,
      limit,
      offset,
      distinct: true,
    });

    const totalPages = Math.ceil(count / limit);

    return successResponse(res, {
      products: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    }, 'Products fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getProductByIdOrSlug = async (req, res, next) => {
  try {
    const { identifier } = req.params;
    const isId = !isNaN(identifier);

    const product = await Product.findOne({
      where: isId ? { id: identifier } : { slug: identifier },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug'],
        },
        {
          model: Brand,
          as: 'brand',
          attributes: ['id', 'name', 'slug', 'logo'],
        },
        {
          model: ProductImage,
          as: 'images',
          attributes: ['id', 'imageUrl', 'altText', 'isPrimary', 'sortOrder'],
          order: [['sortOrder', 'ASC']],
        },
        {
          model: ProductVariant,
          as: 'variants',
        },
        {
          model: Review,
          as: 'reviews',
          where: { isApproved: true },
          required: false,
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'avatar'],
            },
          ],
          order: [['createdAt', 'DESC']],
        },
      ],
    });

    if (!product) {
      return errorResponse(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    return successResponse(res, { product }, 'Product details retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const getFilters = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      where: { status: true },
      attributes: ['id', 'name', 'slug'],
    });

    const brands = await Brand.findAll({
      attributes: ['id', 'name', 'slug'],
    });

    const variants = await ProductVariant.findAll({
      attributes: ['color', 'colorHex', 'size'],
      raw: true,
    });

    const colors = [...new Set(variants.map(v => v.color).filter(Boolean))];
    const sizes = [...new Set(variants.map(v => v.size).filter(Boolean))];

    return successResponse(res, {
      categories,
      brands,
      colors,
      sizes,
      priceRange: { min: 0, max: 2000 },
    }, 'Filters retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductByIdOrSlug,
  getFilters,
};
