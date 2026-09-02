const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { requireAuth } = require('../middleware/auth');

router.get('/product/:productId', reviewController.getProductReviews);
router.post('/', requireAuth, reviewController.createReview);

module.exports = router;
