import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import teamRoutes from "./routes/team.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import setupRoutes from "./routes/setup.routes.js";
import userRoutes from "./routes/users.routes.js";
import { securityMiddleware } from "./middlewares/security.middleware.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import locationRoutes from "./routes/location.routes.js";
import productRoutes from "./routes/product.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import {
  checkEmailVerified,
  protectedRoute,
} from "./middlewares/auth.middleware.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import checkoutRoutes from "./routes/checkout.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import orderRoutes from "./routes/order.routes.js";
dotenv.config();

const app = express();

// Stripe webhook needs to be registered before the json parser
app.use(
  "/api/webhooks",
  express.raw({ type: "application/json" }),
  webhookRoutes
);

app.use(express.json());

// Security middlewares (helmet, cors, rate limiting, etc)
securityMiddleware(app);

// Routes
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to API",
  });
});
app.use("/api/setup", setupRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/users/", userRoutes);
app.use("/api/inventory", protectedRoute, checkEmailVerified, inventoryRoutes);
app.use("/api/location", protectedRoute, checkEmailVerified, locationRoutes);
app.use("/api/product", protectedRoute, checkEmailVerified, productRoutes);
app.use("/api/invoice", protectedRoute, invoiceRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/cart", protectedRoute, checkEmailVerified, cartRoutes);
app.use("/api/checkout", protectedRoute, checkEmailVerified, checkoutRoutes);
app.use("/api/orders", protectedRoute, checkEmailVerified, orderRoutes);
// Global error handler
app.use(globalErrorHandler);

export default app;
