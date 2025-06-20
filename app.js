import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import teamRoutes from "./routes/team.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import setupRoutes from "./routes/setup.routes.js";
import userRoutes from "./routes/users.routes.js";
import { securityMiddleware } from "./middleware/security.middleware.js";
import { globalErrorHandler } from "./middleware/globalErrorHandler.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import locationRoutes from "./routes/location.routes.js";
import productRoutes from "./routes/product.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import {
  checkEmailVerified,
  protectedRoute,
} from "./middleware/auth.middleware.js";
import invoiceRoutes from "./routes/invoice.routes.js";
dotenv.config();

const app = express();

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
// Global error handler
app.use(globalErrorHandler);

export default app;
