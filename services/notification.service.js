import renderTemplate from "../utils/templateRenderer.js";
import Notification from "../models/Notification.js";
import { io, connectedUsers } from "../server.js";

export default async function createNotification(type, data, recipients) {
  const content = renderTemplate("notifications", type, data);
  const notificationTitles = {
    documentUpdate: "Document Update Required",
    inventoryAlert: "Inventory Alert",
    createdOrder: "New Order Created",
    newOrder: "New Order Received",
    orderStatusChange: "Order Status Updated",
    partnerRequest: "New Partner Connection Request",
    partnerRequestUpdate: "Partner Connection Request updated",
    partnerVisibilityUpdated: "Partner Visibility Settings Updated",
    shipmentUpdate: "Shipment Update",
    systemAlert: "System Alert",
    taskAssignment: "New Task Assigned",
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
