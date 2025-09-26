import renderTemplate from "../utils/templateRenderer.js";
import Notification from "../models/Notification.schema.js";
import { io, connectedUsers } from "../server.js";
import { notificationTitles } from "../enums/notificationType.enum.js";

export default async function createNotification(type, data, recipients) {
  const content = renderTemplate("notifications", type, data);
  const userList = Array.isArray(recipients)
    ? recipients.map((user) => (user._id ? user._id : user))
    : [recipients].map((user) => (user._id ? user._id : user));
  console.log("Creating notification for users:", userList);

  for (const user of userList) {
    const notification = await Notification.create({
      recipient: user,
      title: notificationTitles[type] || "Notification",
      type,
      content,
      read: false,
    });

    let userId;
    if (typeof user === "object" && user.toHexString) {
      userId = user.toHexString(); // if it's a Mongoose ObjectId
    } else {
      userId = user.toString(); // if it's a string or other type
    }
    const socketId = connectedUsers.get(userId);
    console.log(`Emitting notification to user ${user}:`, notification);
    if (socketId) {
      io.to(socketId).emit("new-notification", notification);
    }
  }
}
