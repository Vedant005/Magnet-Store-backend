import { Router } from "express";
import {
  addToCart,
  clearCart,
  decreaseItem,
  getUserCart,
  increaseItem,
  removeFromCart,
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/add/:productId").post(addToCart);

router.route("/get").get(getUserCart);

router.route("/remove/:productId").delete(removeFromCart);

router.route("/clear").delete(clearCart);

router.route("/increase/:productId").post(increaseItem);

router.route("/decrease/:productId").post(decreaseItem);

export default router;
