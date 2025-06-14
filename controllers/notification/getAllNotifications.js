import Notification from "../../models/Notification.js";
import { AppError } from "../../utils/AppError.js";

export const getAllNotifications = async (req, res) => {
  const { isRead } = req.query;
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  try {
    const result = await Notification.find({
      recipient: req.user._id,
      ...(isRead !== undefined ? { isRead: isRead === "true" } : {}),
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();
    res.status(200).json({ status: "success", ...result });
  } catch (err) {
    throw new AppError(err.message || "Failed to get notifications", 500);
  }
};
