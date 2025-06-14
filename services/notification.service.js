import renderTemplate from "../utils/templateRenderer.js";
import Notification from "../models/Notification.js";

export default async function createNotification(templateName, data, users) {
  const content = renderTemplate("notifications", templateName, data);

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

  const userList = Array.isArray(users) ? users : [users];
  for (const user of userList) {
    await Notification.create({
      user: user._id,
      title: notificationTitles[templateName] || "Notification",
      type: templateName,
      content,
      read: false,
    });
  }
}
