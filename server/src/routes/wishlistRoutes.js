const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.get('/', wishlistController.getWishlist);
router.post('/toggle', wishlistController.toggleWishlistItem);
router.post('/move-to-cart', wishlistController.moveToCart);

module.exports = router;
