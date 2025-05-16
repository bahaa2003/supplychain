import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import teamRoutes from "./routes/team.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { securityMiddleware } from "./middleware/security.middleware.js";
import { globalErrorHandler } from "./middleware/globalErrorHandler.js";

dotenv.config();

const app = express();

app.use(express.json());

// Security middlewares (helmet, cors, rate limiting, etc)
securityMiddleware(app);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/team", teamRoutes);
app.use("/api/admin", adminRoutes);

// Global error handler
app.use(globalErrorHandler);

export default app;