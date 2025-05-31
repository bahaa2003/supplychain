import markAllNotificationsAsRead from "../../utils/notification/markAllNotificationsAsRead.js";
import { AppError } from "../../utils/AppError.js";

export const markAllNotificationsAsReadController = async (req, res) => {
  try {
    await markAllNotificationsAsRead(req.user._id);
    res.status(200).json({ status: "success" });
  } catch (err) {
    throw new AppError(
      err.message || "Failed to mark all notifications as read",
      500
    );
  }
};
