import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import teamRoutes from "./routes/team.routes.js";
import companyRoutes from "./routes/company.routes.js";
import setupRoutes from "./routes/setup.routes.js";
import userRoutes from "./routes/users.routes.js";
import partnerConnectionRoutes from "./routes/partnerConnection.routes.js";
import inventoryRoutes from "./routes/inventory.routes.js";
import locationRoutes from "./routes/location.routes.js";
import invoiceRoutes from "./routes/invoice.routes.js";
import orderRoutes from "./routes/order.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import analyticsRoutes from "./routes/analytics.route.js";
import webhookRoutes from "./routes/webhook.routes.js";
import subscriptionRoutes from "./routes/subscription.routes.js";
import getEnumRoutes from "./routes/common.route.js";
import messageRoutes from "./routes/messages.route.js";
import { securityMiddleware } from "./middlewares/security.middleware.js";
import { globalErrorHandler } from "./middlewares/globalErrorHandler.js";
import {
  checkEmailVerified,
  protectedRoute,
} from "./middlewares/auth.middleware.js";
dotenv.config();

const app = express();

app.use(cors());
// Security middlewares (helmet, cors, rate limiting, etc)
// securityMiddleware(app);
app.use(express.json());
app.use("/api/webhook", webhookRoutes);

// Routes
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to API",
  });
});
app.use("/api/common", protectedRoute, getEnumRoutes);
app.use("/api/setup", setupRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/company", protectedRoute, companyRoutes);
app.use("/api/user/", userRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use(
  "/api/partner-connection",
  protectedRoute,
  checkEmailVerified,
  partnerConnectionRoutes
);
app.use("/api/inventory", protectedRoute, checkEmailVerified, inventoryRoutes);
app.use("/api/location", protectedRoute, checkEmailVerified, locationRoutes);
app.use("/api/invoice", protectedRoute, invoiceRoutes);
app.use("/api/notification", notificationRoutes);
app.use("/api/messages", protectedRoute, checkEmailVerified, messageRoutes);
app.use("/api/order", protectedRoute, checkEmailVerified, orderRoutes);

// Global error handler
app.use(globalErrorHandler);

export default app;
