import express from "express";
import { protectedRoute, allowedTo } from "../middleware/auth.middleware.js";
import { roleEnum } from "../enums/role.enum.js";
import { getOrdersSentByCompany } from "../controllers/order/getOrdersSentByCompany.js";
import { getOrdersReceivedByCompany } from "../controllers/order/getOrdersReceivedByCompany.js";
import { createOrder } from "../controllers/order/createOrder.js";
import { getOrderById } from "../controllers/order/getOrderById.js";
import { updateOrderStatus } from "../controllers/order/updateOrderStatus.js";
import { deleteOrder } from "../controllers/order/deleteOrder.js";

const router = express.Router();

// Get all orders sent by the current user's company (sender)
router.get(
  "/sent",
  protectedRoute,
  allowedTo("admin", "manager", "staff"),
  getOrdersSentByCompany
);

// Get all orders received by the current user's company (receiver)
router.get(
  "/received",
  protectedRoute,
  allowedTo("admin", "manager", "staff"),
  getOrdersReceivedByCompany
);

// Create a new order (sender only)
router.post(
  "/",
  protectedRoute,
  allowedTo("admin", "manager", "staff"),
  createOrder
);

// Get order by ID (must be sender or receiver)
router.get("/:id", protectedRoute, allowedTo(...roleEnum), getOrderById);

// Update order status (receiver only)
router.patch(
  "/:id/status",
  protectedRoute,
  allowedTo("admin", "manager", "staff"),
  updateOrderStatus
);

// Delete order (sender only, if allowed)
router.delete(
  "/:id",
  protectedRoute,
  allowedTo("admin", "manager"),
  deleteOrder
);

export default router;
