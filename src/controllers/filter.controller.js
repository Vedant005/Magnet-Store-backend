import { asyncHandler } from "../utils/asyncHandler.js";
import { Product } from "../models/product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const filterProducts = asyncHandler(async (req, res) => {
  const { search, sortBy, priceRange, categoryFilter, ratings } = req.query;

  let filterQuery = {};
  let sortQuery = {};

  // Search by product title
  if (search) {
    filterQuery.title = { $regex: search, $options: "i" };
  }

  // Filter by price range
  if (priceRange) {
    const [minPrice, maxPrice] = priceRange.split("-").map(Number);
    filterQuery.price = { $gte: minPrice || 0, $lte: maxPrice || Infinity };
  }

  // Filter by categories
  if (categoryFilter) {
    const categories = Array.isArray(categoryFilter)
      ? categoryFilter
      : categoryFilter.split(",");
    filterQuery.categoryName = { $in: categories };
  }

  // Filter by ratings
  if (ratings) {
    filterQuery.ratings = { $gte: Number(ratings) };
  }

  // Sorting logic
  if (sortBy) {
    if (sortBy === "LTH") sortQuery.price = 1; // Low to High
    if (sortBy === "HTL") sortQuery.price = -1; // High to Low
  }

  // Fetch filtered products with sorting
  let products = await Product.find(filterQuery).sort(sortQuery);

  if (!products) {
    products = await Product.find();
  }

  // Return the response
  return res
    .status(200)
    .json(
      new ApiResponse(200, products, "Filtered products retrieved successfully")
    );
});
