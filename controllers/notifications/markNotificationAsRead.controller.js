import Notification from "../../models/Notification.js";
import { AppError } from "../../utils/AppError.js";

export const markNotificationAsReadController = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id, isRead: false },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notification) throw new AppError("Notification not found", 404);
    res.status(200).json({ status: "success", data: notification });
  } catch (err) {
    throw new AppError(
      err.message || "Failed to mark notification as read",
      500
    );
  }
};
