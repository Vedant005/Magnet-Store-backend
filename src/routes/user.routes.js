import { Router } from "express";

import {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  updateAccountDetails,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(loginUser);

router.route("/register").post(registerUser);

router.route("/logout").post(logoutUser);

router.route("/current-user").get(verifyJWT, getCurrentUser);

router.route("/update-account").patch(verifyJWT, updateAccountDetails);

export default router;
