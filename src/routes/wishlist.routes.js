import { Router } from "express";

import {
  addToWishlist,
  clearWishlist,
  getWishlistItems,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";

const router = Router();

router.route("/add-wishlist").post(addToWishlist);

router.route("/get-wishlist-items").get(getWishlistItems);

router.route("/remove-from-wishlist").delete(removeFromWishlist);

router.route("/clear-wishlist").delete(clearWishlist);

export default router;
