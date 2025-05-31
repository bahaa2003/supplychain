import Notification from "../../models/Notification.js";

const markNotificationAsRead = async (notificationId) => {
  return await Notification.findByIdAndUpdate(
    notificationId,
    { isRead: true, readAt: new Date() },
    { new: true }
  );
};

export default markNotificationAsRead;
