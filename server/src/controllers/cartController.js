const { Cart, CartItem, Product, ProductVariant, ProductImage } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const calculateCartTotals = (items) => {
  let subtotal = 0;
  items.forEach(item => {
    const unitPrice = parseFloat(item.product.discountPrice || item.product.price) +
      (item.variant ? parseFloat(item.variant.additionalPrice || 0) : 0);
    subtotal += unitPrice * item.quantity;
  });

  const tax = subtotal * 0.05; // 5% tax
  const shipping = subtotal > 100 || items.length === 0 ? 0 : 10;
  const total = subtotal + tax + shipping;

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    shipping: parseFloat(shipping.toFixed(2)),
    discount: 0.00,
    total: parseFloat(total.toFixed(2)),
    itemCount: items.reduce((acc, curr) => acc + curr.quantity, 0),
  };
};

const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    let [cart] = await Cart.findOrCreate({ where: { userId } });

    const cartWithItems = await Cart.findByPk(cart.id, {
      include: [
        {
          model: CartItem,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              include: [
                {
                  model: ProductImage,
                  as: 'images',
                  attributes: ['imageUrl', 'isPrimary'],
                },
              ],
            },
            {
              model: ProductVariant,
              as: 'variant',
            },
          ],
        },
      ],
    });

    const items = cartWithItems ? cartWithItems.items : [];
    const totals = calculateCartTotals(items);

    return successResponse(res, {
      cartId: cart.id,
      items,
      totals,
    }, 'Cart retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, variantId, quantity = 1 } = req.body;

    if (!productId) {
      return errorResponse(res, 'Product ID is required', 400, 'VALIDATION_ERROR');
    }

    const product = await Product.findByPk(productId);
    if (!product || !product.status) {
      return errorResponse(res, 'Product not found or unavailable', 404, 'PRODUCT_NOT_FOUND');
    }

    let variant = null;
    let availableStock = product.stock;

    if (variantId) {
      variant = await ProductVariant.findOne({ where: { id: variantId, productId } });
      if (!variant) {
        return errorResponse(res, 'Selected product variant not found', 404, 'VARIANT_NOT_FOUND');
      }
      availableStock = variant.stock;
    }

    if (availableStock < quantity) {
      return errorResponse(res, `Only ${availableStock} items in stock.`, 400, 'INSUFFICIENT_STOCK');
    }

    const [cart] = await Cart.findOrCreate({ where: { userId } });

    let cartItem = await CartItem.findOne({
      where: {
        cartId: cart.id,
        productId,
        variantId: variantId || null,
      },
    });

    if (cartItem) {
      const newQty = cartItem.quantity + quantity;
      if (newQty > availableStock) {
        return errorResponse(res, `Cannot add more. Available stock is ${availableStock}`, 400, 'INSUFFICIENT_STOCK');
      }
      cartItem.quantity = newQty;
      await cartItem.save();
    } else {
      cartItem = await CartItem.create({
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        quantity,
      });
    }

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return errorResponse(res, 'Quantity must be at least 1', 400, 'INVALID_QUANTITY');
    }

    const [cart] = await Cart.findOrCreate({ where: { userId } });
    const cartItem = await CartItem.findOne({
      where: { id: itemId, cartId: cart.id },
      include: [
        { model: Product, as: 'product' },
        { model: ProductVariant, as: 'variant' },
      ],
    });

    if (!cartItem) {
      return errorResponse(res, 'Cart item not found', 404, 'ITEM_NOT_FOUND');
    }

    const stock = cartItem.variant ? cartItem.variant.stock : cartItem.product.stock;
    if (quantity > stock) {
      return errorResponse(res, `Only ${stock} items available in stock.`, 400, 'INSUFFICIENT_STOCK');
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const [cart] = await Cart.findOrCreate({ where: { userId } });
    await CartItem.destroy({ where: { id: itemId, cartId: cart.id } });

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [cart] = await Cart.findOrCreate({ where: { userId } });
    await CartItem.destroy({ where: { cartId: cart.id } });

    return successResponse(res, { items: [], totals: { subtotal: 0, tax: 0, shipping: 0, total: 0, itemCount: 0 } }, 'Cart cleared successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
