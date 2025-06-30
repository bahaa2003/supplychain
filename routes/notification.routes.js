import express from "express";
import { protectedRoute, allowedTo } from "../middlewares/auth.middleware.js";
import { roleEnum } from "../enums/role.enum.js";
import { getAllNotifications } from "../controllers/notification/getAllNotifications.controller.js";
import { getNotificationById } from "../controllers/notification/getNotificationById.controller.js";
import { markNotificationAsReadController } from "../controllers/notification/markNotificationAsRead.controller.js";
import { markAllNotificationsAsReadController } from "../controllers/notification/markAllNotificationsAsRead.controller.js";
import { deleteNotificationController } from "../controllers/notification/deleteNotification.controller.js";
import { deleteAllNotificationsForUserController } from "../controllers/notification/deleteAllNotificationsForUser.controller.js";

const router = express.Router();
router.use(protectedRoute, allowedTo(...roleEnum));

router
  .route("/")
  .get(getAllNotifications) // Get all notifications for the current user (with pagination)
  .patch(markAllNotificationsAsReadController) // Mark all notifications as read
  .delete(deleteAllNotificationsForUserController); // Delete all notifications for the current user

router
  .route("/:id")
  .get(getNotificationById) // Get a single notification by ID
  .patch(markNotificationAsReadController) // Mark a notification as read
  .delete(deleteNotificationController); // Delete a notification

export default router;
