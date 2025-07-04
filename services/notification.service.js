import renderTemplate from "../utils/templateRenderer.js";
import Notification from "../models/Notification.js";
import { io, connectedUsers } from "../server.js";
import { notificationType } from "../enums/notificationType.enum.js";

export default async function createNotification(type, data, recipients) {
  const content = renderTemplate("notifications", type, data);
  const notificationTitles = {
    [notificationType.DOCUMENT_UPDATE]: "Document Update Required",
    [notificationType.INVENTORY_ALERT]: "Inventory Alert",
    [notificationType.CREATED_ORDER]: "New Order Created",
    [notificationType.NEW_ORDER]: "New Order Received",
    [notificationType.ORDER_STATUS_CHANGE]: "Order Status Updated",
    [notificationType.PARTNER_REQUEST]: "New Partner Connection Request",
    [notificationType.PARTNER_CONNECTION_UPDATE]: "Partner Connection updated",
    [notificationType.PARTNER_VISIBILITY_UPDATED]:
      "Partner Visibility Settings Updated",
    [notificationType.SHIPMENT_UPDATE]: "Shipment Update",
    [notificationType.SYSTEM_ALERT]: "System Alert",
    [notificationType.TASK_ASSIGNMENT]: "New Task Assigned",
  };

  const userList = Array.isArray(recipients) ? recipients : [recipients];

  for (const user of userList) {
    const notification = await Notification.create({
      recipient: user,
      title: notificationTitles[type] || "Notification",
      type,
      content,
      read: false,
    });

    // Emit notification to the user via socket.io
    console.log(`Emitting notification to user ${user}:`, notification);
    const socketId = connectedUsers.get(user.toString());
    if (socketId) {
      io.to(socketId).emit("new-notification", notification);
    }
  }
}
