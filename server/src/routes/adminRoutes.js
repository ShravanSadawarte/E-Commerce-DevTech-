const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roles');

router.use(requireAuth);
router.use(requireAdmin);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// Products
router.get('/products', adminController.getAdminProducts);
router.post('/products', adminController.createAdminProduct);
router.put('/products/:id', adminController.updateAdminProduct);
router.delete('/products/:id', adminController.deleteAdminProduct);

// Categories
router.get('/categories', adminController.getAdminCategories);
router.post('/categories', adminController.createAdminCategory);
router.put('/categories/:id', adminController.updateAdminCategory);
router.delete('/categories/:id', adminController.deleteAdminCategory);

// Orders
router.get('/orders', adminController.getAdminOrders);
router.put('/orders/:id/status', adminController.updateAdminOrderStatus);

// Users
router.get('/users', adminController.getAdminUsers);
router.put('/users/:id/status', adminController.updateAdminUserStatus);

// Live Chat Support Console
router.get('/conversations', adminController.getAdminConversations);
router.get('/conversations/:id', adminController.getAdminConversationMessages);
router.post('/conversations/:id/messages', adminController.sendAdminChatMessage);

module.exports = router;
