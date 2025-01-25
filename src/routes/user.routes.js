import { Router } from "express";

import {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  updateAccountDetails,
  refreshAccessToken,
} from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
// import { refreshToken } from "../middlewares/refreshToken.middleware.js";

const router = Router();

router.route("/login").post(loginUser);

router.route("/register").post(registerUser);

router.route("/logout").post(logoutUser);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/current-user").get(verifyJWT, getCurrentUser);

router.route("/update-account").patch(verifyJWT, updateAccountDetails);

export default router;
