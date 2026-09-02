const { Wishlist, WishlistItem, Product, ProductImage, ProductVariant, Cart, CartItem } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [wishlist] = await Wishlist.findOrCreate({ where: { userId } });

    const wishlistWithItems = await Wishlist.findByPk(wishlist.id, {
      include: [
        {
          model: WishlistItem,
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
                {
                  model: ProductVariant,
                  as: 'variants',
                },
              ],
            },
          ],
        },
      ],
    });

    const items = wishlistWithItems ? wishlistWithItems.items : [];
    return successResponse(res, { items }, 'Wishlist retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const toggleWishlistItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return errorResponse(res, 'Product ID is required', 400, 'VALIDATION_ERROR');
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return errorResponse(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    const [wishlist] = await Wishlist.findOrCreate({ where: { userId } });

    const existingItem = await WishlistItem.findOne({
      where: { wishlistId: wishlist.id, productId },
    });

    let isWishlisted = false;
    if (existingItem) {
      await existingItem.destroy();
      isWishlisted = false;
    } else {
      await WishlistItem.create({
        wishlistId: wishlist.id,
        productId,
      });
      isWishlisted = true;
    }

    return successResponse(res, { isWishlisted, productId }, isWishlisted ? 'Added to wishlist' : 'Removed from wishlist');
  } catch (error) {
    next(error);
  }
};

const moveToCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, variantId } = req.body;

    const [wishlist] = await Wishlist.findOrCreate({ where: { userId } });
    const [cart] = await Cart.findOrCreate({ where: { userId } });

    // Remove from wishlist
    await WishlistItem.destroy({
      where: { wishlistId: wishlist.id, productId },
    });

    // Add to cart
    let cartItem = await CartItem.findOne({
      where: { cartId: cart.id, productId, variantId: variantId || null },
    });

    if (cartItem) {
      cartItem.quantity += 1;
      await cartItem.save();
    } else {
      await CartItem.create({
        cartId: cart.id,
        productId,
        variantId: variantId || null,
        quantity: 1,
      });
    }

    return successResponse(res, {}, 'Item moved to cart successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWishlist,
  toggleWishlistItem,
  moveToCart,
};
