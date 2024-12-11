import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { isValidObjectId } from "mongoose";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find();
    return res
      .status(200)
      .json(new ApiResponse(200, products, "Products Fetched!"));
  } catch (error) {
    throw new ApiError(500, "Error fetching products");
  }
});

const getSingleProduct = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  if (!isValidObjectId(productId)) {
    throw new ApiError(400, "Product id is invalid");
  }

  const singleProduct = await Product.findById(productId);

  if (!singleProduct) {
    throw new ApiError(400, "Product not available");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, singleProduct, "Product fetched!"));
});

const createProduct = asyncHandler(async (req, res) => {
  const {
    title,
    inStock,
    categoryName,
    brandName,
    price,
    discount,
    ratings,
    quantity,
    description,
  } = req.body;

  // Log the received data
  // console.log("Request Body:", req.body);

  let imageLocalPath;

  if (req.files && Array.isArray(req.files.img) && req.files.img.length > 0) {
    imageLocalPath = req.files.img[0].path;
  }

  if (!imageLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const img = await uploadOnCloudinary(imageLocalPath);

  if (!img) {
    throw new ApiError(400, "Image file required");
  }

  const productData = {
    title: title?.trim(),
    inStock: inStock === "true" || inStock === true, // Convert to Boolean
    categoryName: categoryName?.trim(),
    brandName: brandName?.trim(),
    price: Number(price), // Convert to Number
    discount: Number(discount), // Convert to Number
    ratings: ratings ? Number(ratings) : 0, // Default to 0 if undefined
    quantity: Number(quantity), // Convert to Number
    description: description?.trim(),
    img: img.url,
  };

  // Create the product
  const product = await Product.create(productData);

  // Respond with the created product
  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully!"));
});

export { getAllProducts, getSingleProduct, createProduct };
