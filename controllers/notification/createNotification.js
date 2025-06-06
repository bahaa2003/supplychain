import Notification from "../../models/Notification.js";
import notificationTemplates from "../../utils/notification/notificationTemplates.js";
import { AppError } from "../../utils/AppError.js";

export const createNotificationController = async (req, res) => {
  try {
    const { type, data, recipient } = req.body;

    // Validate required fields
    if (!type || !data || !recipient) {
      throw new AppError(
        "Missing required fields: type, data, and recipient are required",
        400
      );
    }

    // Validate template data
    try {
      notificationTemplates.validateTemplateData(type, data);
    } catch (error) {
      throw new AppError(error.message, 400);
    }

    // Create notification using template
    const notificationData = notificationTemplates.createNotification(
      type,
      data,
      recipient
    );

    // Create notification in database
    const notification = await Notification.create(notificationData);

    res.status(201).json({
      status: "success",
      data: notification,
    });
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(err.message || "Failed to create notification", 500);
  }
};
