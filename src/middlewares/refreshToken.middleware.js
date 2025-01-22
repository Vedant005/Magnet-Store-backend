import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import jwt from "jsonwebtoken";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Something went wrong while generating tokens");
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const incomingRefreshToken = req.cookies.refreshToken;
    const existingAccessToken = req.cookies.accessToken;

    if (!incomingRefreshToken) {
      throw new ApiError(401, "Refresh token is required");
    }

    try {
      // Validate the refresh token
      const decodedRefreshToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      const user = await User.findById(decodedRefreshToken?._id);

      if (!user || incomingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or invalid");
      }

      // Optional: Check if the access token is still valid
      if (existingAccessToken) {
        try {
          jwt.verify(existingAccessToken, process.env.ACCESS_TOKEN_SECRET);
          return res
            .status(200)
            .json(new ApiResponse(200, null, "Access token is still valid"));
        } catch (err) {
          // If access token is invalid, proceed to generate a new one
          console.log("Access token expired, generating a new one...");
        }
      }

      // Generate new tokens
      const { accessToken, refreshToken: newRefreshToken } =
        await generateAccessAndRefreshToken(user._id);

      // Update the user's refresh token in the database
      user.refreshToken = newRefreshToken;
      await user.save();

      // Set new tokens in cookies
      const options = {
        httpOnly: true,
        secure: true,
        sameSite: "none", // For cross-origin cookies
        path: "/", // Ensure the cookie is available globally
      };

      res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options);
    } catch (error) {
      throw new ApiError(401, error?.message || "Invalid refresh token");
    }
  } catch (err) {
    return next(err);
  }
};
