import sendNotificationToUsers from "../../utils/notification/sendNotificationToUsers.js";
import { AppError } from "../../utils/AppError.js";

export const sendNotificationToUsersController = async (req, res) => {
  try {
    const notifications = await sendNotificationToUsers(req.body);
    res.status(201).json({ status: "success", data: notifications });
  } catch (err) {
    throw new AppError(err.message || "Failed to send notifications", 500);
  }
};
