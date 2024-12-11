import mongoose, { Schema } from "mongoose";

const filterSchema = new Schema(
  {
    categories: [
      {
        type: String,
        required: true,
      },
    ],
    priceRanges: [
      {
        min: Number,
        max: Number,
      },
    ],
    ratings: {
      type: [Number],
      required: true,
    },
    sortOptions: {
      type: [String],
      default: ["LTH", "HTL"],
    },
  },
  { timestamps: true }
);

export const Filter = mongoose.model("Filter", filterSchema);
