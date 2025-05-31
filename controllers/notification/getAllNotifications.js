import getUserNotifications from "../../utils/notification/getUserNotifications.js";
import { AppError } from "../../utils/AppError.js";

export const getAllNotifications = async (req, res) => {
  const { isRead, page, limit } = req.query;
  try {
    const result = await getUserNotifications(req.user._id, {
      isRead: isRead === undefined ? undefined : isRead === "true",
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
    res.status(200).json({ status: "success", ...result });
  } catch (err) {
    throw new AppError(err.message || "Failed to get notifications", 500);
  }
};
