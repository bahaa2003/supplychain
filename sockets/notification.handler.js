import Notification from "../models/Notification.schema.js";
import renderTemplate from "../utils/templateRenderer.js";
import { notificationTitles } from "../enums/notificationType.enum.js";
import { getIO } from "./index.js";

export const createAndEmitNotification = async (type, data, recipients) => {
  const io = getIO();
  const content = renderTemplate("notifications", type, data);
  const userList = Array.isArray(recipients) ? recipients : [recipients];

  console.log("Creating notification for users:", userList);

  for (const userId of userList) {
    const recipient = userId.toString();
    const notification = await Notification.create({
      recipient,
      title: notificationTitles[type] || "Notification",
      type,
      content,
      read: false,
    });

    const notificationRoom = `notification-${recipient}`;

    if (notificationRoom) {
      io.to(notificationRoom).emit("new-notification", notification);
      console.log(`Notification emitted to user ${recipient}`);
    }
  }
};

export const handleNotificationEvents = (io, socket) => {
  // event handlers for notifications e.g., mark as read, fetch notifications, etc.
};
