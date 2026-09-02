const { sequelize, Order, OrderItem, Cart, CartItem, Product, ProductVariant, ProductImage, Address, Payment, User } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const createOrder = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { addressId, paymentMethod = 'RAZORPAY', notes } = req.body;

    if (!addressId) {
      await transaction.rollback();
      return errorResponse(res, 'Shipping address is required.', 400, 'VALIDATION_ERROR');
    }

    const address = await Address.findOne({ where: { id: addressId, userId } });
    if (!address) {
      await transaction.rollback();
      return errorResponse(res, 'Shipping address not found.', 404, 'ADDRESS_NOT_FOUND');
    }

    const cart = await Cart.findOne({
      where: { userId },
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              include: [{ model: ProductImage, as: 'images' }],
            },
            {
              model: ProductVariant,
              as: 'variant',
            },
          ],
        },
      ],
      transaction,
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      await transaction.rollback();
      return errorResponse(res, 'Your cart is empty.', 400, 'EMPTY_CART');
    }

    let subtotal = 0;
    const orderItemsData = [];

    // Verify stock & calculate server-side pricing
    for (const item of cart.items) {
      const product = item.product;
      const variant = item.variant;

      if (!product || !product.status) {
        await transaction.rollback();
        return errorResponse(res, `Product ${product ? product.name : 'Unknown'} is unavailable.`, 400, 'PRODUCT_UNAVAILABLE');
      }

      const availableStock = variant ? variant.stock : product.stock;
      if (availableStock < item.quantity) {
        await transaction.rollback();
        return errorResponse(res, `Insufficient stock for ${product.name}. Available: ${availableStock}`, 400, 'INSUFFICIENT_STOCK');
      }

      const basePrice = parseFloat(product.discountPrice || product.price);
      const additionalPrice = variant ? parseFloat(variant.additionalPrice || 0) : 0;
      const unitPrice = basePrice + additionalPrice;
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      const primaryImg = product.images && product.images.length > 0 ? product.images[0].imageUrl : '';
      const variantStr = variant ? `${variant.color ? 'Color: ' + variant.color + ' ' : ''}${variant.size ? 'Size: ' + variant.size : ''}`.trim() : null;

      orderItemsData.push({
        productId: product.id,
        variantId: variant ? variant.id : null,
        productName: product.name,
        productImage: primaryImg,
        variantInfo: variantStr,
        quantity: item.quantity,
        unitPrice: parseFloat(unitPrice.toFixed(2)),
        totalPrice: parseFloat(itemTotal.toFixed(2)),
      });

      // Deduct stock
      if (variant) {
        variant.stock -= item.quantity;
        await variant.save({ transaction });
      }
      product.stock -= item.quantity;
      await product.save({ transaction });
    }

    const tax = parseFloat((subtotal * 0.05).toFixed(2));
    const shippingFee = subtotal > 100 ? 0.00 : 10.00;
    const discount = 0.00;
    const totalAmount = parseFloat((subtotal + tax + shippingFee - discount).toFixed(2));

    const addressSnapshot = JSON.stringify({
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
    });

    const orderNumber = `ORD-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const order = await Order.create({
      orderNumber,
      userId,
      addressId,
      shippingAddressSnapshot: addressSnapshot,
      subtotal,
      shippingFee,
      tax,
      discount,
      totalAmount,
      status: 'Pending',
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending',
      paymentMethod,
      notes,
    }, { transaction });

    for (const itemData of orderItemsData) {
      await OrderItem.create({
        ...itemData,
        orderId: order.id,
      }, { transaction });
    }

    // Create payment entry
    await Payment.create({
      orderId: order.id,
      userId,
      provider: paymentMethod === 'COD' ? 'COD' : 'RAZORPAY',
      amount: totalAmount,
      currency: 'INR',
      status: 'Pending',
    }, { transaction });

    // Clear cart items
    await CartItem.destroy({ where: { cartId: cart.id }, transaction });

    await transaction.commit();

    const createdOrder = await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items' },
        { model: Address, as: 'shippingAddress' },
        { model: Payment, as: 'payment' },
      ],
    });

    return successResponse(res, { order: createdOrder }, 'Order created successfully', 201);
  } catch (error) {
    await transaction.rollback();
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orders = await Order.findAll({
      where: { userId },
      include: [
        { model: OrderItem, as: 'items' },
        { model: Address, as: 'shippingAddress' },
        { model: Payment, as: 'payment' },
      ],
      order: [['createdAt', 'DESC']],
    });
    return successResponse(res, { orders }, 'Orders fetched successfully');
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = ['ADMIN', 'SUPER_ADMIN', 'SUPPORT'].includes(req.user.role);

    const where = { id };
    if (!isAdmin) {
      where.userId = userId;
    }

    const order = await Order.findOne({
      where,
      include: [
        { model: OrderItem, as: 'items' },
        { model: Address, as: 'shippingAddress' },
        { model: Payment, as: 'payment' },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone'],
        },
      ],
    });

    if (!order) {
      return errorResponse(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
    }

    return successResponse(res, { order }, 'Order retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
};
