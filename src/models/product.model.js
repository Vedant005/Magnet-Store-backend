import mongoose, { Schema } from "mongoose";

const productSchema = new Schema(
  {
    title: {
      type: String,

      trim: true,
    },
    inStock: {
      type: Boolean,
    },
    categoryName: {
      type: String,
    },
    brandName: {
      type: String,
    },
    price: {
      type: String,
    },
    discount: {
      type: String,
    },
    ratings: {
      type: String,
      default: 0,
      min: 0,
      max: 5,
    },
    quantity: {
      type: String,

      min: 0,
    },
    description: {
      type: String,
    },
    img: {
      type: String,
    },
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", productSchema);
