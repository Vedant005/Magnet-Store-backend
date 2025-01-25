import { Router } from "express";

import {
  clearWishlist,
  getUserWishlist,
  toggleWishlist,
} from "../controllers/wishlist.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
// import { refreshToken } from "../middlewares/refreshToken.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/toggle/:productId").post(toggleWishlist);

router.route("/get/").get(getUserWishlist);

router.route("/clear").delete(clearWishlist);

export default router;
