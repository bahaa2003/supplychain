// Centralized enum for notification types
export const notificationType = {
  NOTIFICATION: "notification",
  CREATED_ORDER: "createdOrder",
  NEW_ORDER: "newOrder",
  ORDER_STATUS_CHANGE: "orderStatusChange",
  SHIPMENT_UPDATE: "shipmentUpdate",
  INVENTORY_ALERT: "inventoryAlert",
  PARTNER_REQUEST: "partnerRequest",
  DOCUMENT_UPDATE: "documentUpdate",
  TASK_ASSIGNMENT: "taskAssignment",
  SYSTEM_ALERT: "systemAlert",
  PARTNER_CONNECTION_UPDATE: "partnerConnectionUpdate",
};
export const notificationTitles = {
  [notificationType.CREATED_ORDER]: "New Order Created",
  [notificationType.NEW_ORDER]: "New Order Received",
  [notificationType.ORDER_STATUS_CHANGE]: "Order Status Updated",
  [notificationType.SHIPMENT_UPDATE]: "Shipment Update",
  [notificationType.INVENTORY_ALERT]: "Inventory Alert",
  [notificationType.PARTNER_REQUEST]: "New Partner Connection Request",
  [notificationType.DOCUMENT_UPDATE]: "Document Update Required",
  [notificationType.TASK_ASSIGNMENT]: "New Task Assigned",
  [notificationType.SYSTEM_ALERT]: "System Alert",
  [notificationType.PARTNER_CONNECTION_UPDATE]: "Partner Connection updated",
  [notificationType.PARTNER_VISIBILITY_UPDATED]:
    "Partner Visibility Settings Updated",
};

export const notificationTypeEnum = Object.values(notificationType);
