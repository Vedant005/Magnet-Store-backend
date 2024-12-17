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

  if (!mongoose.isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product ID");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  let cart = await Cart.findOne({ user: userId });
  console.log(product);
  console.log("Total---->> ", cart.totalAmount + product.price);

  if (!cart) {
    cart = new Cart({
      user: userId,
      items: [{ product: productId, quantity: 1 }],
      totalAmount: product.price,
    });
  } else {
    const productInCart = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (productInCart) {
      return res
        .status(200)
        .json(new ApiResponse(200, cart, "Product already exists in cart"));
    }

    // const productIndex = cart.items.findIndex(
    //   (item) => item.product.toString() === productId
    // );

    // if (productIndex > -1) {
    //   cart.items[productIndex].quantity += 1;
    // } else {
    cart.items.push({ product: productId, quantity: 1 });
    cart.totalAmount += product.price;
    // }
  }

  // Save the cart
  await cart.save();

  res.status(201).json({
    success: true,
    message: "Product added to cart",
    cart,
  });
});

const getUserCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  console.log(req);

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "User Id invalid");
  }

  const userCart = await Cart.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, userCart, "User cart fetched"));
});

// const getCartItems = asyncHandler(async (req, res) => {
//   const { userId } = req.params;

//   const cart = await Cart.findById({ userId });

//   if (!cart) {
//     throw new ApiResponse(201, "Cart is empty");
//   }

//   return res.status(200).json(new ApiResponse(200, cart, "Cart Fetched"));
// });

const removeFromCart = asyncHandler(async (req, res) => {
  const { productId, userId } = req.params;

  if (!isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product id");
  }

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid product id");
  }

  const product = await Product.findOne({ productId });

  if (!product) {
    throw new ApiError(400, "Product not found");
  }

  const resultCart = await Cart.findByIdAndUpdate(
    userId,
    {
      $pull: {
        product: productId,
      },
    },
    { new: true }
  );

  if (!resultCart) {
    throw new ApiError(400, "Item could not be removed from cart");
  }

  return res.status(200).json(new ApiResponse(200, "Item removed"));
});

const clearCart = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invlaid user");
  }

  const user = await User.findOne({ userId });

  // if (!user) {
  //   throw new ApiError(400, "User does not exist");
  // }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new ApiError(404, "Cart does not exist for this user");
  }

  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();

  res.status(200).json(new ApiResponse(200, cart, "Cart cleard!"));
});

const increaseItem = asyncHandler(async (req, res) => {
  const { productId, userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (!isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product id");
  }

  const cart = await Cart.findOne({ userId });

  if (!cart) {
    throw new ApiError(400, "Cart items not found");
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    throw new ApiError(404, "Product not found in cart");
  }

  cart.items[itemIndex].quantity += 1;

  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart item quantity increased"));
});

const decreaseItem = asyncHandler(async (req, res) => {
  const { productId, userId } = req.params;

  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (!isValidObjectId(productId)) {
    throw new ApiError(400, "Invalid product id");
  }

  const cart = await Cart.findOne({ userId });

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

  await cart.save();

  return res
    .status(200)
    .json(new ApiResponse(200, cart, "Cart item quantity decreased"));
});

export {
  addToCart,
  getUserCart,
  removeFromCart,
  clearCart,
  increaseItem,
  decreaseItem,
};
