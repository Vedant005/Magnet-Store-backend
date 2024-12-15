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

router.route("/remove/:productId/:userId").delete(removeFromCart);

router.route("/clear").delete(clearCart);

router.route("/increase/:productId/:userId").post(increaseItem);

router.route("/decrease/:productId/:userId").post(decreaseItem);

export default router;
