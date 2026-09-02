const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.post('/create-order', paymentController.createRazorpayOrder);
router.post('/verify', paymentController.verifyPayment);

module.exports = router;
