import Notification from "../models/Notification.schema.js";
import renderTemplate from "../utils/templateRenderer.js";
import { notificationTitles } from "../enums/notificationType.enum.js";

export const createAndEmitNotification = async (
  io,
  connectedUsers,
  type,
  data,
  recipients
) => {
  const content = renderTemplate("notifications", type, data);
  const userList = Array.isArray(recipients)
    ? recipients.map((user) => (user._id ? user._id : user))
    : [recipients].map((user) => (user._id ? user._id : user));

  console.log("Creating notification for users:", userList);

  for (const userId of userList) {
    const notification = await Notification.create({
      recipient: userId,
      title: notificationTitles[type] || "Notification",
      type,
      content,
      read: false,
    });

    const userIdString = userId.toHexString
      ? userId.toHexString()
      : userId.toString();
    const socketId = connectedUsers.get(userIdString);

    if (socketId) {
      io.to(socketId).emit("new-notification", notification);
      console.log(`Notification emitted to user ${userIdString}`);
    }
  }
};

export const handleNotificationEvents = (io, socket) => {
  // event handlers for notifications e.g., mark as read, fetch notifications, etc.
};
