import Notification from "../../models/Notification.js";

const sendNotificationToUsers = async ({ recipients, ...notificationData }) => {
  if (!Array.isArray(recipients))
    throw new Error("recipients must be an array");
  const notifications = recipients.map((recipient) => ({
    ...notificationData,
    recipient,
  }));
  return await Notification.insertMany(notifications);
};

export default sendNotificationToUsers;
