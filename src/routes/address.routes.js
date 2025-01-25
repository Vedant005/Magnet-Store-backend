import express from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/address.controller.js";
// import  } from "../middleware.middleware.js";

const router = express.Router();

// Require authentication for all routes
router.use(verifyJWT);

router.get("/get", getAllAddresses); // Get all addresses
router.post("/create", createAddress); // Create a new address
router.put("/:addressId", updateAddress); // Update an address
router.delete("/:addressId", deleteAddress); // Delete an address

export default router;
