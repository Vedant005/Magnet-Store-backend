import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Cart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";

const addToCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  // Validate product ID
  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  // Check if the product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Find or create cart
  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = new Cart({
      user: userId,
      items: [{ product: productId, quantity: 1 }],
      totalAmount: product.price, // Set initial totalAmount to the product price
    });
  } else {
    const productInCart = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (productInCart) {
      // If product already exists in cart, respond without altering totalAmount
      return res
        .status(200)
        .json(new ApiResponse(200, cart, "Product already exists in cart"));
    }
    // Add new product to cart
    cart.items.push({ product: productId, quantity: 1 });

    // Update totalAmount by adding the new product's price
    cart.totalAmount += product.price;
  }

  await cart.save();

  const enrichedCart = await Cart.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
      },
    },
    { $unwind: "$items" },
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
      $addFields: {
        "items.title": "$productDetails.title",
        "items.price": "$productDetails.price",
        "items.discount": "$productDetails.discount",
        "items.ratings": "$productDetails.ratings",
        "items.img": "$productDetails.img",
        "items.finalPrice": {
          $subtract: [
            "$productDetails.price",
            {
              $multiply: [
                "$productDetails.price",
                { $divide: ["$productDetails.discount", 100] },
              ],
            },
          ],
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        user: { $first: "$user" },
        items: {
          $push: {
            product: "$items.product",
            title: "$items.title",
            quantity: "$items.quantity",
            price: "$items.price",
            discount: "$items.discount",
            finalPrice: "$items.finalPrice",
            ratings: "$items.ratings",
            img: "$items.img",
          },
        },
        preTotalAmount: {
          $sum: {
            $multiply: ["$items.price", "$items.quantity"], // Ensure valid operands
          },
        },
        totalAmount: {
          $sum: { $multiply: ["$items.finalPrice", "$items.quantity"] },
        },
      },
    },
  ]);

  if (!enrichedCart || enrichedCart.length === 0) {
    throw new ApiError(404, "Cart not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, enrichedCart[0], "Item added to cart successfully")
    );
});

const getUserCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "User Id invalid");
  }

  const user = await User.findById(userId);

  if (!user) {
    throw new ApiError(402, "Unauthoris=zed request!");
  }
  const enrichedCart = await Cart.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
      },
    },
    { $unwind: "$items" },
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
      $addFields: {
        "items.title": "$productDetails.title",
        "items.price": "$productDetails.price",
        "items.discount": "$productDetails.discount",
        "items.ratings": "$productDetails.ratings",
        "items.img": "$productDetails.img",
        "items.finalPrice": {
          $subtract: [
            "$productDetails.price",
            {
              $multiply: [
                "$productDetails.price",
                { $divide: ["$productDetails.discount", 100] },
              ],
            },
          ],
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        user: { $first: "$user" },
        items: {
          $push: {
            product: "$items.product",
            title: "$items.title",
            quantity: "$items.quantity",
            price: "$items.price",
            discount: "$items.discount",
            finalPrice: "$items.finalPrice",
            ratings: "$items.ratings",
            img: "$items.img",
          },
        },
        preTotalAmount: {
          $sum: {
            $multiply: ["$items.price", "$items.quantity"], // Ensure valid operands
          },
        },
        totalAmount: {
          $sum: { $multiply: ["$items.finalPrice", "$items.quantity"] },
        },
      },
    },
  ]);

  if (!enrichedCart) {
    throw new ApiError(404, "Cart not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, enrichedCart[0], "User cart fetched"));
});

const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  // Validate IDs
  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  // Check if the product exists
  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  // Find the cart and check if the product is in the cart
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    throw new ApiError(404, "Product not found in cart");
  }

  // Calculate the total amount to deduct
  const itemToRemove = cart.items[itemIndex];
  const amountToDeduct = itemToRemove.quantity * product.price;

  // Remove the item from the cart
  cart.items.splice(itemIndex, 1);
  cart.totalAmount -= amountToDeduct;
  if (cart.totalAmount < 0) {
    cart.totalAmount = 0;
  }

  // Save the updated cart
  await cart.save();

  res.status(200).json(new ApiResponse(200, cart, "Item removed from cart"));
});

const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invlaid user");
  }

  const user = await User.findOne(userId);

  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new ApiError(404, "Cart does not exist for this user");
  }

  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();

  res.status(200).json(new ApiResponse(200, cart, "Cart cleard!"));
});

const increaseItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  // Validate IDs
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user ID");
  }

  if (!isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  // Find the cart
  const cart = await Cart.findOne({ user: userId });
  if (!cart) {
    throw new ApiError(404, "Cart not found");
  }

  // Find the product in the cart
  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    throw new ApiError(404, "Product not found in cart");
  }

  // Increase the quantity
  cart.items[itemIndex].quantity += 1;

  // Save the updated cart
  await cart.save();

  // Enrich the cart with product details
  const enrichedCart = await Cart.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
      },
    },
    { $unwind: "$items" },
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
      $addFields: {
        "items.title": "$productDetails.title",
        "items.price": "$productDetails.price",
        "items.discount": "$productDetails.discount",
        "items.ratings": "$productDetails.ratings",
        "items.img": "$productDetails.img",
        "items.finalPrice": {
          $subtract: [
            "$productDetails.price",
            {
              $multiply: [
                "$productDetails.price",
                { $divide: ["$productDetails.discount", 100] },
              ],
            },
          ],
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        user: { $first: "$user" },
        items: {
          $push: {
            product: "$items.product",
            title: "$items.title",
            quantity: "$items.quantity",
            price: "$items.price",
            discount: "$items.discount",
            finalPrice: "$items.finalPrice",
            ratings: "$items.ratings",
            img: "$items.img",
          },
        },
        preTotalAmount: {
          $sum: {
            $multiply: ["$items.price", "$items.quantity"],
          },
        },
        totalAmount: {
          $sum: { $multiply: ["$items.finalPrice", "$items.quantity"] },
        },
      },
    },
  ]);

  if (!enrichedCart || enrichedCart.length === 0) {
    throw new ApiError(404, "Cart not found");
  }

  // Return the enriched cart
  return res
    .status(200)
    .json(
      new ApiResponse(200, enrichedCart[0], "Cart item quantity increased")
    );
});

const decreaseItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (!isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product id");
  }

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new ApiError(400, "Cart items not found");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    throw new ApiError(404, "Product not found in cart");
  }

  cart.items[itemIndex].quantity -= 1;
  if (cart.items[itemIndex].quantity < 0) {
    cart.items[itemIndex].quantity = 0;
  }

  await cart.save();

  const enrichedCart = await Cart.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
      },
    },
    { $unwind: "$items" },
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
      $addFields: {
        "items.title": "$productDetails.title",
        "items.price": "$productDetails.price",
        "items.discount": "$productDetails.discount",
        "items.ratings": "$productDetails.ratings",
        "items.img": "$productDetails.img",
        "items.finalPrice": {
          $subtract: [
            "$productDetails.price",
            {
              $multiply: [
                "$productDetails.price",
                { $divide: ["$productDetails.discount", 100] },
              ],
            },
          ],
        },
      },
    },
    {
      $group: {
        _id: "$_id",
        user: { $first: "$user" },
        items: {
          $push: {
            product: "$items.product",
            title: "$items.title",
            quantity: "$items.quantity",
            price: "$items.price",
            discount: "$items.discount",
            finalPrice: "$items.finalPrice",
            ratings: "$items.ratings",
            img: "$items.img",
          },
        },
        preTotalAmount: {
          $sum: {
            $multiply: ["$items.price", "$items.quantity"],
          },
        },
        totalAmount: {
          $sum: { $multiply: ["$items.finalPrice", "$items.quantity"] },
        },
      },
    },
  ]);

  if (!enrichedCart || enrichedCart.length === 0) {
    throw new ApiError(404, "Cart not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, enrichedCart[0], "Cart item quantity decreased")
    );
});

export {
  addToCart,
  getUserCart,
  removeFromCart,
  clearCart,
  increaseItem,
  decreaseItem,
};
