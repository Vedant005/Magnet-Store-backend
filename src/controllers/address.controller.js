import { Address } from "../models/address.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Get all addresses for a user
export const getAllAddresses = asyncHandler(async (req, res) => {
  const addresses = await Address.find({ user: req.user._id });
  res
    .status(200)
    .json(new ApiResponse(200, addresses, "Addresses fetched successfully"));
});

// Create a new address
export const createAddress = asyncHandler(async (req, res) => {
  const {
    fullName,
    phoneNumber,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
  } = req.body;

  if (
    ![
      fullName,
      phoneNumber,
      addressLine1,
      city,
      state,
      postalCode,
      country,
    ].every(Boolean)
  ) {
    throw new ApiError(400, "All required fields must be provided");
  }

  const address = await Address.create({
    user: req.user._id,
    fullName,
    phoneNumber,
    addressLine1,
    addressLine2,
    city,
    state,
    postalCode,
    country,
  });

  res
    .status(201)
    .json(new ApiResponse(201, address, "Address created successfully"));
});

// Update an address
export const updateAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;
  const updates = req.body;

  const address = await Address.findOneAndUpdate(
    { _id: addressId, user: req.user._id },
    updates,
    { new: true, runValidators: true }
  );

  if (!address) {
    throw new ApiError(404, "Address not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, address, "Address updated successfully"));
});

// Delete an address
export const deleteAddress = asyncHandler(async (req, res) => {
  const { addressId } = req.params;

  const address = await Address.findOneAndDelete({
    _id: addressId,
    user: req.user._id,
  });

  res
    .status(200)
    .json(new ApiResponse(200, address, "Address deleted successfully"));
});
