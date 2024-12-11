import express from "express";
import { filterProducts } from "../controllers/filter.controller.js";

const router = express.Router();

router.get("/apply-filter", filterProducts);

export default router;
