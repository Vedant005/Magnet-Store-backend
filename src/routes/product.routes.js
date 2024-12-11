import { Router } from "express";

import {
  createProduct,
  getAllProducts,
  getSingleProduct,
} from "../controllers/product.controller.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/products").get(getAllProducts);

router.route("/products/:productId").get(getSingleProduct);

router.route("/create-product").post(
  upload.fields([
    {
      name: "img",
      maxCount: 1,
    },
  ]),
  createProduct
);

export default router;