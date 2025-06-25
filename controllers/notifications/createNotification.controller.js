import { AppError } from "../../utils/AppError.js";
import createNotification from "../../services/notification.service.js";
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

    await createNotification(type, data, recipient);

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
