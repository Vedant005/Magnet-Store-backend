import { Address } from "../models/address.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get all addresses for a user
const getAllAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id });
  res
    .status(200)
    .json(new ApiResponse(200, addresses, "Addresses fetched successfully"));
});

// Create a new address
const createAddress = asyncHandler(async (req, res) => {
  const { street, district, city, state, pinCode, country } = req.body;

  if (![street, district, city, state, pinCode, country].every(Boolean)) {
    throw new ApiError(400, "All required fields must be provided");
  }

  const address = await Address.create({
    user: req.user._id,
    street,
    district,
    city,
    state,
    pinCode,
    country,
  });
  if (!address) {
    throw new ApiError(500, "Something went wrong while creating address");
  }

  res
    .status(201)
    .json(new ApiResponse(201, address, "Address created successfully"));
});

// Update an address
const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const { street, district, city, state, pinCode, country } = req.body;

  const address = await Address.findByAndUpdate(
    { _id: addressId, user: req.user._id },
    {
      $set: {
        street: street,
        district: district,
        city: city,
        state: state,
        pinCode: pinCode,
        country: country,
      },
    },
    { new: true }
  );

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, address, "Address updated successfully"));
});

// Delete an address
const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const address = await Address.findOneAndDelete({
    _id: addressId,
    user: req.user._id,
  });

  res
    .status(200)
    .json(new ApiResponse(200, address, "Address deleted successfully"));
});

export { getAllAddresses, createAddress, updateAddress, deleteAddress };
