import Notification from "../../models/Notification.js";

const markAllNotificationsAsRead = async (userId) => {
  return await Notification.updateMany(
    { recipient: userId, isRead: false },
    { isRead: true, readAt: new Date() }
  );
};

export default markAllNotificationsAsRead;
