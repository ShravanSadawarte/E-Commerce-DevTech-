const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');
const { optionalAuth, requireAuth } = require('../middleware/auth');

router.get('/slots', bookingController.getAvailableSlots);
router.post('/', optionalAuth, bookingController.createBooking);
router.get('/my-bookings', requireAuth, bookingController.getMyBookings);

module.exports = router;
