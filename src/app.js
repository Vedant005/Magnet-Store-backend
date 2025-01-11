import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import cron from "cron";
import axios from "axios";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

cron.schedule("*/30 * * * *", async () => {
  try {
    const response = await axios.get(`${process.env.BACKEND_URL}/health`);
    console.log(`Health check response: ${response.status}`);
  } catch (error) {
    console.error(`Health check error: ${error.message}`);
  }
});

//routes import

import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";
import wishlistRouter from "./routes/wishlist.routes.js";
import filterRouter from "./routes/filter.routes.js";
import addressRouter from "./routes/address.routes.js";

app.use("/api/v1/users", userRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/wishlist", wishlistRouter);
app.use("/api/v1/filter", filterRouter);
app.use("/api/v1/address", addressRouter);
app.get("/health", (req, res) => {
  res.send("OK");
});

export { app };
