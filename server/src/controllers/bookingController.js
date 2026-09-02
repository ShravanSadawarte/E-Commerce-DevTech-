const { Booking } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const ALL_TIME_SLOTS = [
  '10:00 AM',
  '11:00 AM',
  '01:00 PM',
  '02:00 PM',
  '04:00 PM',
  '05:00 PM',
];

const getAvailableSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return errorResponse(res, 'Date query parameter is required (YYYY-MM-DD)', 400, 'VALIDATION_ERROR');
    }

    const bookedSlots = await Booking.findAll({
      where: {
        date,
        status: ['Pending', 'Confirmed'],
      },
      attributes: ['timeSlot'],
    });

    const bookedSlotList = bookedSlots.map(b => b.timeSlot);
    const slots = ALL_TIME_SLOTS.map(slot => ({
      slot,
      isAvailable: !bookedSlotList.includes(slot),
    }));

    return successResponse(res, { date, slots }, 'Available time slots retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const createBooking = async (req, res, next) => {
  try {
    const userId = req.user ? req.user.id : null;
    const { date, timeSlot, customerName, email, phone, notes, serviceType } = req.body;

    if (!date || !timeSlot || !customerName || !email || !phone) {
      return errorResponse(res, 'Date, time slot, customer name, email, and phone are required.', 400, 'VALIDATION_ERROR');
    }

    // Check if slot is already booked on this date
    const existing = await Booking.findOne({
      where: {
        date,
        timeSlot,
        status: ['Pending', 'Confirmed'],
      },
    });

    if (existing) {
      return errorResponse(res, `The time slot ${timeSlot} on ${date} is already booked. Please choose another time.`, 409, 'SLOT_UNAVAILABLE');
    }

    const booking = await Booking.create({
      userId,
      customerName,
      email,
      phone,
      serviceType: serviceType || 'Personal Stylist Consultation',
      date,
      timeSlot,
      status: 'Confirmed',
      notes,
    });

    return successResponse(res, { booking }, 'Your appointment has been confirmed successfully!', 201);
  } catch (error) {
    next(error);
  }
};

const getMyBookings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.findAll({
      where: { userId },
      order: [['date', 'ASC'], ['timeSlot', 'ASC']],
    });
    return successResponse(res, { bookings }, 'Bookings retrieved successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAvailableSlots,
  createBooking,
  getMyBookings,
};
