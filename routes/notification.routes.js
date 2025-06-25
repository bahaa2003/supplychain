import express from "express";
import { protectedRoute, allowedTo } from "../middlewares/auth.middleware.js";
import { roleEnum } from "../enums/role.enum.js";
import { validate } from "../middlewares/validate.middleware.js";
import { notificationValidator } from "../validators/notification.validator.js";
import { getAllNotifications } from "../controllers/notifications/getAllNotifications.controller.js";
import { getNotificationById } from "../controllers/notifications/getNotificationById.controller.js";
import { markNotificationAsReadController } from "../controllers/notifications/markNotificationAsRead.controller.js";
import { markAllNotificationsAsReadController } from "../controllers/notifications/markAllNotificationsAsRead.controller.js";
import { deleteNotificationController } from "../controllers/notifications/deleteNotification.controller.js";
import { deleteAllNotificationsForUserController } from "../controllers/notifications/deleteAllNotificationsForUser.controller.js";
import { createNotificationController } from "../controllers/notifications/createNotification.controller.js";

const router = express.Router();

// Get all notifications for the current user (with pagination)
router.get("/", protectedRoute, allowedTo(...roleEnum), getAllNotifications);

// Get a single notification by ID
router.get("/:id", protectedRoute, allowedTo(...roleEnum), getNotificationById);

// Mark a notification as read
router.patch(
  "/:id/read",
  protectedRoute,
  allowedTo(...roleEnum),
  markNotificationAsReadController
);

// Mark all notifications as read
router.patch(
  "/read-all",
  protectedRoute,
  allowedTo(...roleEnum),
  markAllNotificationsAsReadController
);

// Delete a notification
router.delete(
  "/:id",
  protectedRoute,
  allowedTo(...roleEnum),
  deleteNotificationController
);

// Delete all notifications for the current user
router.delete(
  "/",
  protectedRoute,
  allowedTo(...roleEnum),
  deleteAllNotificationsForUserController
);

// Create a notification (for admin/platform_admin only)
router.post(
  "/",
  protectedRoute,
  allowedTo("admin", "platform_admin"),
  validate(notificationValidator()),
  createNotificationController
);

export default router;
