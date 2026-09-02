const Razorpay = require('razorpay');
require('dotenv').config();

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 's9G7Y6F7E3B2A1Z9X8W7V6U5';

let razorpayInstance = null;

try {
  razorpayInstance = new Razorpay({
    key_id,
    key_secret,
  });
} catch (error) {
  console.warn('[Razorpay] Initialized with fallback mock settings:', error.message);
}

module.exports = {
  razorpayInstance,
  key_id,
  key_secret,
};
