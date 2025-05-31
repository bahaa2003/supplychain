import Notification from "../../models/Notification.js";

const getUserNotifications = async (
  userId,
  { isRead, limit = 20, page = 1 } = {}
) => {
  const filter = { recipient: userId };
  if (typeof isRead === "boolean") filter.isRead = isRead;
  const skip = (page - 1) * limit;
  const [notifications, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
  ]);
  return {
    notifications,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export default getUserNotifications;
