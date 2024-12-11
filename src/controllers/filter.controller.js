import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

export const filterProducts = asyncHandler(async (req, res) => {
  const { search, sortBy, priceRange, categoryFilter, ratings } = req.query;

  let filterQuery = {};

  // Search by product title
  if (search) {
    filterQuery.title = { $regex: search, $options: "i" };
  }

  // Filter by price range
  if (priceRange) {
    filterQuery.price = { $lte: Number(priceRange) };
  }

  // Filter by categories
  if (categoryFilter) {
    const categories = categoryFilter.split(",");
    filterQuery.categoryName = { $in: categories };
  }

  // Filter by ratings
  if (ratings) {
    filterQuery.ratings = { $gte: Number(ratings) };
  }

  // Fetch filtered products
  let products = await Product.find(filterQuery);

  // Sort products
  if (sortBy) {
    switch (sortBy) {
      case "LTH":
        products = products.sort((a, b) => a.price - b.price);
        break;
      case "HTL":
        products = products.sort((a, b) => b.price - a.price);
        break;
      default:
        break;
    }
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, products, "Filtered products retrieved successfully")
    );
});
