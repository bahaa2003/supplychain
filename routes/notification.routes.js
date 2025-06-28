import express from "express";
import { protectedRoute, allowedTo } from "../middlewares/auth.middleware.js";
import { roleEnum } from "../enums/role.enum.js";
import { getAllNotifications } from "../controllers/notification/getAllNotifications.js";
import { getNotificationById } from "../controllers/notification/getNotificationById.js";
import { markNotificationAsReadController } from "../controllers/notification/markNotificationAsRead.js";
import { markAllNotificationsAsReadController } from "../controllers/notification/markAllNotificationsAsRead.js";
import { deleteNotificationController } from "../controllers/notification/deleteNotification.js";
import { deleteAllNotificationsForUserController } from "../controllers/notification/deleteAllNotificationsForUser.js";

const router = express.Router();

router
  .route("/")
  .use(protectedRoute, allowedTo(...roleEnum))
  .get(getAllNotifications) // Get all notifications for the current user (with pagination)
  .patch(markAllNotificationsAsReadController) // Mark all notifications as read
  .delete(deleteAllNotificationsForUserController); // Delete all notifications for the current user

router
  .route("/:id")
  .use(protectedRoute, allowedTo(...roleEnum))
  .get(getNotificationById) // Get a single notification by ID
  .patch(markNotificationAsReadController) // Mark a notification as read
  .delete(deleteNotificationController); // Delete a notification

export default router;
