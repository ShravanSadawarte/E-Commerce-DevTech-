const { Op } = require('sequelize');
const {
  sequelize,
  User,
  Category,
  Brand,
  Product,
  ProductImage,
  ProductVariant,
  Order,
  OrderItem,
  Payment,
  Review,
  Conversation,
  Message,
} = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// 1. Dashboard Statistics
const getDashboardStats = async (req, res, next) => {
  try {
    const totalRevenueResult = await Order.sum('totalAmount', {
      where: { paymentStatus: 'Paid' },
    });
    const totalRevenue = parseFloat((totalRevenueResult || 0).toFixed(2));

    const totalOrders = await Order.count();
    const totalUsers = await User.count({ where: { role: 'CUSTOMER' } });
    const totalProducts = await Product.count();
    const pendingOrders = await Order.count({ where: { status: 'Pending' } });
    const lowStockProducts = await Product.count({ where: { stock: { [Op.lte]: 10 } } });

    // Recent 5 orders
    const recentOrders = await Order.findAll({
      limit: 6,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: OrderItem, as: 'items' },
      ],
    });

    // Top selling products / low stock items
    const lowStockList = await Product.findAll({
      where: { stock: { [Op.lte]: 10 } },
      limit: 5,
      include: [{ model: ProductImage, as: 'images' }],
      order: [['stock', 'ASC']],
    });

    // Mock/Aggregate weekly sales data for chart
    const chartData = [
      { day: 'Mon', revenue: totalRevenue * 0.12, orders: Math.round(totalOrders * 0.12) || 2 },
      { day: 'Tue', revenue: totalRevenue * 0.15, orders: Math.round(totalOrders * 0.15) || 4 },
      { day: 'Wed', revenue: totalRevenue * 0.10, orders: Math.round(totalOrders * 0.10) || 1 },
      { day: 'Thu', revenue: totalRevenue * 0.18, orders: Math.round(totalOrders * 0.18) || 5 },
      { day: 'Fri', revenue: totalRevenue * 0.22, orders: Math.round(totalOrders * 0.22) || 7 },
      { day: 'Sat', revenue: totalRevenue * 0.14, orders: Math.round(totalOrders * 0.14) || 3 },
      { day: 'Sun', revenue: totalRevenue * 0.09, orders: Math.round(totalOrders * 0.09) || 2 },
    ];

    return successResponse(res, {
      stats: {
        totalRevenue,
        totalOrders,
        totalUsers,
        totalProducts,
        pendingOrders,
        lowStockProducts,
      },
      chartData,
      recentOrders,
      lowStockList,
    }, 'Admin dashboard metrics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// 2. Product Management
const getAdminProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;
    const { search, categoryId } = req.query;

    const where = {};
    if (search) {
      where.name = { [Op.like]: `%${search}%` };
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const { count, rows } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Brand, as: 'brand', attributes: ['id', 'name'] },
        { model: ProductImage, as: 'images' },
        { model: ProductVariant, as: 'variants' },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return successResponse(res, {
      products: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const createAdminProduct = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      name,
      slug,
      description,
      shortDescription,
      price,
      discountPrice,
      sku,
      stock = 0,
      categoryId,
      brandId,
      isFeatured = false,
      images = [],
      variants = [],
    } = req.body;

    if (!name || !price || !categoryId) {
      await transaction.rollback();
      return errorResponse(res, 'Name, price, and category are required.', 400, 'VALIDATION_ERROR');
    }

    const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

    const product = await Product.create({
      name,
      slug: productSlug,
      description,
      shortDescription,
      price,
      discountPrice: discountPrice || null,
      sku: sku || `SKU-${Date.now()}`,
      stock,
      categoryId,
      brandId: brandId || null,
      isFeatured,
      status: true,
    }, { transaction });

    // Create Images
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        await ProductImage.create({
          productId: product.id,
          imageUrl: typeof img === 'string' ? img : img.imageUrl,
          altText: name,
          isPrimary: i === 0,
          sortOrder: i,
        }, { transaction });
      }
    }

    // Create Variants
    if (variants && variants.length > 0) {
      for (const v of variants) {
        await ProductVariant.create({
          productId: product.id,
          color: v.color || null,
          colorHex: v.colorHex || null,
          size: v.size || null,
          sku: v.sku || `${product.sku}-${v.size || ''}-${v.color || ''}`.replace(/\s+/g, '-'),
          stock: v.stock || 0,
          additionalPrice: v.additionalPrice || 0,
        }, { transaction });
      }
    }

    await transaction.commit();

    const fullProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images' },
        { model: ProductVariant, as: 'variants' },
      ],
    });

    return successResponse(res, { product: fullProduct }, 'Product created successfully', 201);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const updateAdminProduct = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      name,
      description,
      shortDescription,
      price,
      discountPrice,
      sku,
      stock,
      categoryId,
      brandId,
      status,
      isFeatured,
      images,
      variants,
    } = req.body;

    const product = await Product.findByPk(id);
    if (!product) {
      await transaction.rollback();
      return errorResponse(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (shortDescription !== undefined) product.shortDescription = shortDescription;
    if (price !== undefined) product.price = price;
    if (discountPrice !== undefined) product.discountPrice = discountPrice || null;
    if (sku) product.sku = sku;
    if (stock !== undefined) product.stock = stock;
    if (categoryId) product.categoryId = categoryId;
    if (brandId !== undefined) product.brandId = brandId || null;
    if (status !== undefined) product.status = status;
    if (isFeatured !== undefined) product.isFeatured = isFeatured;

    await product.save({ transaction });

    // Update images if provided
    if (images && Array.isArray(images)) {
      await ProductImage.destroy({ where: { productId: product.id }, transaction });
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        await ProductImage.create({
          productId: product.id,
          imageUrl: typeof img === 'string' ? img : img.imageUrl,
          altText: product.name,
          isPrimary: i === 0,
          sortOrder: i,
        }, { transaction });
      }
    }

    // Update variants if provided
    if (variants && Array.isArray(variants)) {
      await ProductVariant.destroy({ where: { productId: product.id }, transaction });
      for (const v of variants) {
        await ProductVariant.create({
          productId: product.id,
          color: v.color || null,
          colorHex: v.colorHex || null,
          size: v.size || null,
          sku: v.sku || `${product.sku}-${v.size || ''}-${v.color || ''}`.replace(/\s+/g, '-'),
          stock: v.stock || 0,
          additionalPrice: v.additionalPrice || 0,
        }, { transaction });
      }
    }

    await transaction.commit();

    const fullProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'category' },
        { model: ProductImage, as: 'images' },
        { model: ProductVariant, as: 'variants' },
      ],
    });

    return successResponse(res, { product: fullProduct }, 'Product updated successfully');
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const deleteAdminProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (!product) {
      return errorResponse(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    await product.destroy();
    return successResponse(res, {}, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
};

// 3. Category Management
const getAdminCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      include: [{ model: Product, as: 'products', attributes: ['id'] }],
      order: [['name', 'ASC']],
    });
    return successResponse(res, { categories });
  } catch (error) {
    next(error);
  }
};

const createAdminCategory = async (req, res, next) => {
  try {
    const { name, slug, description, image, status = true } = req.body;
    if (!name) {
      return errorResponse(res, 'Category name is required', 400, 'VALIDATION_ERROR');
    }

    const catSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const category = await Category.create({
      name,
      slug: catSlug,
      description,
      image: image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80',
      status,
    });

    return successResponse(res, { category }, 'Category created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateAdminCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, description, image, status } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return errorResponse(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    if (name) category.name = name;
    if (slug) category.slug = slug;
    if (description !== undefined) category.description = description;
    if (image !== undefined) category.image = image;
    if (status !== undefined) category.status = status;

    await category.save();
    return successResponse(res, { category }, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteAdminCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const productCount = await Product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return errorResponse(res, `Cannot delete category because it contains ${productCount} products.`, 400, 'CATEGORY_NOT_EMPTY');
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return errorResponse(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    await category.destroy();
    return successResponse(res, {}, 'Category deleted successfully');
  } catch (error) {
    next(error);
  }
};

// 4. Order Management
const getAdminOrders = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;
    const { status, paymentStatus, search } = req.query;

    const where = {};
    if (status) where.status = status;
    if (paymentStatus) where.paymentStatus = paymentStatus;
    if (search) where.orderNumber = { [Op.like]: `%${search}%` };

    const { count, rows } = await Order.findAndCountAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'phone'] },
        { model: OrderItem, as: 'items' },
        { model: Payment, as: 'payment' },
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset,
      distinct: true,
    });

    return successResponse(res, {
      orders: rows,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateAdminOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, paymentStatus } = req.body;

    const order = await Order.findByPk(id, {
      include: [{ model: Payment, as: 'payment' }],
    });

    if (!order) {
      return errorResponse(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
    }

    if (status) order.status = status;
    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      if (order.payment) {
        order.payment.status = paymentStatus === 'Paid' ? 'Captured' : paymentStatus;
        await order.payment.save();
      }
    }

    await order.save();

    return successResponse(res, { order }, 'Order updated successfully');
  } catch (error) {
    next(error);
  }
};

// 5. User Management
const getAdminUsers = async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']],
    });
    return successResponse(res, { users });
  } catch (error) {
    next(error);
  }
};

const updateAdminUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive, role } = req.body;

    const user = await User.findByPk(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
    }

    if (isActive !== undefined) user.isActive = isActive;
    if (role) user.role = role;

    await user.save();
    return successResponse(res, { user }, 'User status updated successfully');
  } catch (error) {
    next(error);
  }
};

// 8. Admin Chat Management
const getAdminConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.findAll({
      include: [
        { model: Message, as: 'messages', limit: 1, order: [['createdAt', 'DESC']] },
      ],
      order: [['lastMessageAt', 'DESC']],
    });
    return successResponse(res, { conversations });
  } catch (error) {
    next(error);
  }
};

const getAdminConversationMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await Conversation.findByPk(id, {
      include: [
        { model: Message, as: 'messages', order: [['createdAt', 'ASC']] },
      ],
    });

    if (!conversation) {
      return errorResponse(res, 'Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    }

    return successResponse(res, { conversation });
  } catch (error) {
    next(error);
  }
};

const sendAdminChatMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return errorResponse(res, 'Message text is required', 400, 'VALIDATION_ERROR');
    }

    const conversation = await Conversation.findByPk(id);
    if (!conversation) {
      return errorResponse(res, 'Conversation not found', 404, 'CONVERSATION_NOT_FOUND');
    }

    const newMessage = await Message.create({
      conversationId: conversation.id,
      senderId: req.user.id,
      senderType: 'ADMIN',
      senderName: req.user.name,
      message: message.trim(),
      isRead: true,
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
  getDashboardStats,
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  getAdminCategories,
  createAdminCategory,
  updateAdminCategory,
  deleteAdminCategory,
  getAdminOrders,
  updateAdminOrderStatus,
  getAdminUsers,
  updateAdminUserStatus,
  getAdminConversations,
  getAdminConversationMessages,
  sendAdminChatMessage,
};
