import deleteAllNotificationsForUser from "../../utils/notification/deleteAllNotificationsForUser.js";
import { AppError } from "../../utils/AppError.js";

export const deleteAllNotificationsForUserController = async (req, res) => {
  try {
    await deleteAllNotificationsForUser(req.user._id);
    res.status(204).send();
  } catch (err) {
    throw new AppError(
      err.message || "Failed to delete all notifications",
      500
    );
  }
};
