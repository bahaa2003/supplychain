import { AppError } from "../../utils/AppError.js";
import Notification from "../../models/Notification.schema.js";

export const getNotificationById = async (req, res) => {
  try {
    // You can later use a utils function if you add it
    const notification = await Notification.findOne({
      _id: req.params.id,
    });
    if (!notification) throw new AppError("Notification not found", 404);
    res.status(200).json({ status: "success", data: notification });
  } catch (err) {
    throw new AppError(err.message || "Failed to get notification", 500);
  }
};
