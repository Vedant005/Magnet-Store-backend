import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { Wishlist } from "../models/wishlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const userId = req.user._id;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (!isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product id");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(500, "Product not found");
  }

  const wishlist = await Wishlist.findOne({ userId });

  if (wishlist) {
    // const productIndex = wishlist.items.findIndex(
    //   (item) => item.product.toString() === productId
    // );

    wishlist.items.push({
      product: productId,
    });

    await wishlist.save();
  } else {
    wishlist = await Wishlist.create({
      userId,
      items: [
        {
          product: productId,
        },
      ],
    });
  }

  return res
    .status(201)
    .json(new ApiResponse(200, wishlist, "Wishlist created"));
});

const getUserWishlist = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const wishlist = await Wishlist.findById({ userId });

  if (!wishlist) {
    throw new ApiResponse(201, "Cart is empty");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, wishlist, "Wishlist Fetched"));
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const userId = req.user._id;

  if (!isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product id");
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid product id");
  }

  const product = await Product.findOne(productId);

  if (!product) {
    throw new ApiError(400, "Product not found");
  }

  const resultWishlist = await Wishlist.findByIdAndDelete(
    userId,
    {
      $pull: {
        product: productId,
      },
    },
    { new: true }
  );

  if (!resultWishlist) {
    throw new ApiError(400, "Item could not be removed from wishlist");
  }

  return res.status(200).json(new ApiResponse(200, "Item removed"));
});

const clearWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invlaid user");
  }

  const user = await User.findOne({ userId });

  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  const wishlist = await Wishlist.findOne({ userId });

  if (!wishlist) {
    throw new ApiError(404, "Wishlist does not exist for this user");
  }

  wishlist.items = [];
  await wishlist.save();

  res.status(200).json(new ApiResponse(200, "Cart cleard!"));
});

export { addToWishlist, getUserWishlist, removeFromWishlist, clearWishlist };
