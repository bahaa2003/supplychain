import Notification from "../../models/Notification.js";
import { AppError } from "../../utils/AppError.js";

export const getAllNotifications = async (req, res) => {
  const { isRead } = req.query;
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;
  const filter = { recipient: req.user._id };
  if (isRead) filter.isRead = isRead;
  try {
    const result = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();
    res.status(200).json({ status: "success", data: result });
  } catch (err) {
    throw new AppError(err.message || "Failed to get notifications", 500);
  }
};
