import Notification from "../../models/Notification.schema.js";
import { AppError } from "../../utils/AppError.js";

export const deleteAllNotificationsForUserController = async (req, res) => {
  try {
    await Notification.deleteMany({ recipient: req.user._id });
    res.status(204).send();
  } catch (err) {
    throw new AppError(
      err.message || "Failed to delete all notifications",
      500
    );
  }
};
