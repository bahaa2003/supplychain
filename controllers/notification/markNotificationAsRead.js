import markNotificationAsRead from "../../utils/notification/markNotificationAsRead.js";
import { AppError } from "../../utils/AppError.js";

export const markNotificationAsReadController = async (req, res) => {
  try {
    const notification = await markNotificationAsRead(req.params.id);
    if (!notification) throw new AppError("Notification not found", 404);
    res.status(200).json({ status: "success", data: notification });
  } catch (err) {
    throw new AppError(
      err.message || "Failed to mark notification as read",
      500
    );
  }
};
