import Notification from "../../models/Notification.schema.js";
import { AppError } from "../../utils/AppError.js";

export const deleteNotificationController = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    throw new AppError(err.message || "Failed to delete notification", 500);
  }
};
