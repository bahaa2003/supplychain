import renderTemplate from "../utils/templateRenderer.js";
import Notification from "../models/Notification.js";

export default async function createNotification({ type, data, recipients }) {
  const content = renderTemplate("notifications", type, data);
  const notificationTitles = {
    documentUpdate: "Document Update Required",
    inventoryAlert: "Inventory Alert",
    newOrder: "New Order Received",
    orderStatusChange: "Order Status Updated",
    partnerRequest: "New Partner Connection Request",
    partnerRequestUpdate: "Partner Connection Request updated",
    partnerVisibilityUpdated: "Partner Visibility Settings Updated",
    shipmentUpdate: "Shipment Update",
    systemAlert: "System Alert",
    taskAssignment: "New Task Assigned",
  };
  console.log("Notification title:", notificationTitles[type]);

  const userList = Array.isArray(recipients) ? recipients : [recipients];
  for (const user of userList) {
    await Notification.create({
      recipient: user,
      title: notificationTitles[type] || "Notification",
      type,
      content,
      read: false,
    });
  }
}
