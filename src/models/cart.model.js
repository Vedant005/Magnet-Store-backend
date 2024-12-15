import mongoose, { Schema } from "mongoose";

const cartSchema = new Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
    totalAmount: {
      type: String,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

cartSchema.pre("save", function (next) {
  this.totalAmount = this.items.reduce(
    (acc, item) => acc + item.quantity * (item.product.price || 0),
    0
  );
  next();
});

export const Cart = mongoose.model("Cart", cartSchema);
