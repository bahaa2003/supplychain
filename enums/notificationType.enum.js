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

export const notificationTypeEnum = Object.values(notificationType);
