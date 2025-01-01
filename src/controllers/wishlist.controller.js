import mongoose, { isValidObjectId } from "mongoose";
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

  let wishlist = await Wishlist.findOne({ user: userId });

  if (wishlist) {
    const productInList = wishlist.items.find(
      (item) => item.product.toString() === productId
    );

    if (productInList) {
      // If product already exists in cart, respond without altering totalAmount
      return res
        .status(200)
        .json(
          new ApiResponse(200, wishlist, "Product already exists in wishlist")
        );
    }

    wishlist.items.push({
      product: productId,
    });
  } else {
    wishlist = await Wishlist.create({
      user: userId,
      items: [
        {
          product: productId,
        },
      ],
    });
  }

  await wishlist.save();

  const enrichedList = await Wishlist.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $unwind: "$items",
    },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    {
      $group: {
        _id: "$_id",
        user: { $first: "$user" },
        items: {
          $push: {
            _id: "$items.product",
            title: "$productDetails.price",
            price: "$productDetails.price",
            ratings: "$productDetails.ratings",
            img: "$productDetails.img",
          },
        },
      },
    },
  ]);

  if (!enrichedList || enrichedList.length === 0) {
    throw new ApiError(404, "Cart not found");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, enrichedList[0], "Wishlist created"));
});

const getUserWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const enrichedList = await Wishlist.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $unwind: "$items",
    },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    {
      $group: {
        _id: "$_id",
        user: { $first: "$user" },
        items: {
          $push: {
            _id: "$items.product",
            title: "$productDetails.price",
            price: "$productDetails.price",
            ratings: "$productDetails.ratings",
            img: "$productDetails.img",
          },
        },
      },
    },
  ]);

  if (!enrichedList || enrichedList.length === 0) {
    throw new ApiError(404, "Cart not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, enrichedList[0], "Wishlist Fetched"));
});

const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const userId = req.user._id;

  if (!isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product id");
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new ApiError(400, "Product not found");
  }

  const wishlist = await Wishlist.findOne({ user: userId });
  if (!wishlist) {
    throw new ApiError(404, "Wishlist not found");
  }

  const itemIndex = wishlist.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    throw new ApiError(404, "Product not found in wishlist");
  }

  wishlist.items.splice(itemIndex, 1);
  await wishlist.save();

  const enrichedList = await Wishlist.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $unwind: "$items",
    },
    {
      $lookup: {
        from: "products",
        localField: "items.product",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    {
      $group: {
        _id: "$_id",
        user: { $first: "$user" },
        items: {
          $push: {
            _id: "$items.product",
            title: "$productDetails.price",
            price: "$productDetails.price",
            ratings: "$productDetails.ratings",
            img: "$productDetails.img",
          },
        },
      },
    },
  ]);

  if (!enrichedList) {
    throw new ApiError(404, "Wishlist not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, enrichedList[0], "Item removed"));
});

const clearWishlist = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invlaid user");
  }

  const user = await User.findOne(userId);

  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  const wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    throw new ApiError(404, "Wishlist does not exist for this user");
  }

  wishlist.items = [];
  await wishlist.save();

  res.status(200).json(new ApiResponse(200, "Cart cleard!"));
});

export { addToWishlist, getUserWishlist, removeFromWishlist, clearWishlist };
