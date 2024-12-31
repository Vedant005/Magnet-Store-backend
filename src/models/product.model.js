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
      type: Number,
    },
    discount: {
      type: Number,
    },
    ratings: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    quantity: {
      type: Number,

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
