import { Router } from "express";

import {
  addToWishlist,
  clearWishlist,
  getUserWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/add/:productId").post(addToWishlist);

router.route("/get/").get(getUserWishlist);

router.route("/remove/:productId").delete(removeFromWishlist);

router.route("/clear").delete(clearWishlist);

export default router;
