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

router.route("/add/:productId/:userId").post(addToWishlist);

router.route("/get/:userId").get(getUserWishlist);

router.route("/remove/:productId/:userId").delete(removeFromWishlist);

router.route("/clear/:userId").delete(clearWishlist);

export default router;
