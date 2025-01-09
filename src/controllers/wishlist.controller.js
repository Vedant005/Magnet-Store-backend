import mongoose, { isValidObjectId } from "mongoose";
import { Product } from "../models/product.model.js";
import { User } from "../models/user.model.js";
import { Wishlist } from "../models/wishlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleWishlist = asyncHandler(async (req, res) => {
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
    throw new ApiError(404, "Product not found");
  }

  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    // Create a new wishlist if none exists
    wishlist = await Wishlist.create({
      user: userId,
      items: [
        {
          product: productId,
        },
      ],
    });
  } else {
    // Check if the product exists in the wishlist
    const itemIndex = wishlist.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (itemIndex !== -1) {
      // Remove the product if it already exists
      wishlist.items.splice(itemIndex, 1);
    } else {
      // Add the product if it doesn't exist
      wishlist.items.push({
        product: productId,
      });
    }
  }

  await wishlist.save();

  // Fetch the updated wishlist with enriched data
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
            title: "$productDetails.title",
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

  const message = wishlist.items.find(
    (item) => item.product.toString() === productId
  )
    ? "Item added to wishlist"
    : "Item removed from wishlist";

  return res.status(200).json(new ApiResponse(200, enrichedList[0], message));
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
            title: "$productDetails.title",
            price: "$productDetails.price",
            ratings: "$productDetails.ratings",
            brandName: "$productDetails.brandName",
            discount: "$productDetails.discount",
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
    .json(new ApiResponse(200, enrichedList[0], "Wishlist Fetched"));
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

export { toggleWishlist, getUserWishlist, clearWishlist };
