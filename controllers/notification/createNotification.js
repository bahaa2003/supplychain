import createNotification from "../../utils/notification/createNotification.js";
import { AppError } from "../../utils/AppError.js";

export const createNotificationController = async (req, res) => {
  try {
    const notification = await createNotification(req.body);
    res.status(201).json({ status: "success", data: notification });
  } catch (err) {
    throw new AppError(err.message || "Failed to create notification", 500);
  }
};
