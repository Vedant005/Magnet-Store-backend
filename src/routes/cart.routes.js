import { Router } from "express";
import {
  addToCart,
  clearCart,
  decreaseItem,
  getCartItems,
  increaseItem,
  removeFromCart,
} from "../controllers/cart.controller.js";

const router = Router();

router.route("/add-cart").post(addToCart);

router.route("/get-cart-items").get(getCartItems);

router.route("/remove-from-cart").delete(removeFromCart);

router.route("/clear-cart").delete(clearCart);

router.route("/increase-item").delete(increaseItem);

router.route("/decrease-item").delete(decreaseItem);

export default router;
