const { Address } = require('../models');
const { successResponse, errorResponse } = require('../utils/responseHandler');

const getAddresses = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const addresses = await Address.findAll({
      where: { userId },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']],
    });
    return successResponse(res, { addresses }, 'Addresses retrieved successfully');
  } catch (error) {
    next(error);
  }
};

const createAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

    if (!fullName || !phone || !addressLine1 || !city || !state || !postalCode) {
      return errorResponse(res, 'All required address fields must be filled.', 400, 'VALIDATION_ERROR');
    }

    // Check if this is the first address
    const count = await Address.count({ where: { userId } });
    const shouldBeDefault = isDefault || count === 0;

    if (shouldBeDefault) {
      await Address.update({ isDefault: false }, { where: { userId } });
    }

    const address = await Address.create({
      userId,
      fullName,
      phone,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country: country || 'United States',
      isDefault: shouldBeDefault,
    });

    return successResponse(res, { address }, 'Address created successfully', 201);
  } catch (error) {
    next(error);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country, isDefault } = req.body;

    const address = await Address.findOne({ where: { id, userId } });
    if (!address) {
      return errorResponse(res, 'Address not found', 404, 'ADDRESS_NOT_FOUND');
    }

    if (isDefault) {
      await Address.update({ isDefault: false }, { where: { userId } });
      address.isDefault = true;
    }

    if (fullName) address.fullName = fullName;
    if (phone) address.phone = phone;
    if (addressLine1) address.addressLine1 = addressLine1;
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2;
    if (city) address.city = city;
    if (state) address.state = state;
    if (postalCode) address.postalCode = postalCode;
    if (country) address.country = country;

    await address.save();

    return successResponse(res, { address }, 'Address updated successfully');
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const address = await Address.findOne({ where: { id, userId } });
    if (!address) {
      return errorResponse(res, 'Address not found', 404, 'ADDRESS_NOT_FOUND');
    }

    await address.destroy();
    return successResponse(res, {}, 'Address deleted successfully');
  } catch (error) {
    next(error);
  }
};

const setDefaultAddress = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const address = await Address.findOne({ where: { id, userId } });
    if (!address) {
      return errorResponse(res, 'Address not found', 404, 'ADDRESS_NOT_FOUND');
    }

    await Address.update({ isDefault: false }, { where: { userId } });
    address.isDefault = true;
    await address.save();

    return successResponse(res, { address }, 'Default address updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
