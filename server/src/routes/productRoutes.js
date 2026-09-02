const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.get('/', productController.getProducts);
router.get('/filters', productController.getFilters);
router.get('/:identifier', productController.getProductByIdOrSlug);

module.exports = router;
