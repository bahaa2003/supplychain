import Notification from "../../models/Notification.js";
import notificationTemplates from "../../utils/notification/notificationTemplates.js";
import { AppError } from "../../utils/AppError.js";

export const sendNotificationToUsersController = async (req, res) => {
  try {
    const { type, data, recipients } = req.body;

    // Validate required fields
    if (!type || !data || !recipients || !Array.isArray(recipients)) {
      throw new AppError(
        "Missing required fields: type, data, and recipients array are required",
        400
      );
    }

    // Validate template data
    try {
      notificationTemplates.validateTemplateData(type, data);
    } catch (error) {
      throw new AppError(error.message, 400);
    }

    // Create notifications for each recipient
    const notifications = recipients.map((recipient) =>
      notificationTemplates.createNotification(type, data, recipient)
    );

    // Insert all notifications
    const createdNotifications = await Notification.insertMany(notifications);

    res.status(201).json({
      status: "success",
      data: createdNotifications,
    });
  } catch (err) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError(err.message || "Failed to send notifications", 500);
  }
};
