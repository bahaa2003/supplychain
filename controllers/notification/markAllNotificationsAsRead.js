import Notification from "../../models/Notification.js";
import { AppError } from "../../utils/AppError.js";

export const markAllNotificationsAsReadController = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ status: "success" });
  } catch (err) {
    throw new AppError(
      err.message || "Failed to mark all notifications as read",
      500
    );
  }
};
