import Notification from "../../models/Notification.js";

const deleteNotification = async (notificationId) => {
  return await Notification.findByIdAndDelete(notificationId);
};

export default deleteNotification;
