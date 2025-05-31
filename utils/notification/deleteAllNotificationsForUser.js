import Notification from "../../models/Notification.js";

const deleteAllNotificationsForUser = async (userId) => {
  return await Notification.deleteMany({ recipient: userId });
};

export default deleteAllNotificationsForUser;
