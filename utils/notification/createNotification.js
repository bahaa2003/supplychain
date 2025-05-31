import Notification from "../../models/Notification.js";

const createNotification = async ({
  recipient,
  type,
  title,
  message,
  related,
  relatedId,
  priority = "Medium",
  actionRequired = false,
  actionLink = null,
  sentVia = { email: false, inApp: true, sms: false },
}) => {
  return await Notification.create({
    recipient,
    type,
    title,
    message,
    related,
    relatedId,
    priority,
    actionRequired,
    actionLink,
    sentVia,
  });
};

export default createNotification;
