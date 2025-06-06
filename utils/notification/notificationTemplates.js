import { notificationTypeEnum } from "../../enums/notificationType.enum.js";

const templates = {
  "New Order": {
    title: "New Order Received",
    message:
      "A new order has been received for {orderNumber}. Total amount: {amount}",
    priority: "High",
    actionRequired: true,
    actionLink: "/orders/{orderId}",
  },
  "Order Status Change": {
    title: "Order Status Updated",
    message: "Order {orderNumber} status has been updated to {status}",
    priority: "Medium",
    actionRequired: false,
    actionLink: "/orders/{orderId}",
  },
  "Shipment Update": {
    title: "Shipment Update",
    message:
      "Shipment {shipmentNumber} has been {status}. Tracking number: {trackingNumber}",
    priority: "Medium",
    actionRequired: false,
    actionLink: "/shipments/{shipmentId}",
  },
  "Inventory Alert": {
    title: "Inventory Alert",
    message:
      "Product {productName} is running low on stock. Current quantity: {quantity}",
    priority: "High",
    actionRequired: true,
    actionLink: "/inventory/{productId}",
  },
  "Partner Request": {
    title: "New Partner Connection Request",
    message:
      "{requesterCompany} has requested to connect as a {partnershipType} partner",
    priority: "High",
    actionRequired: true,
    actionLink: "/partner-connections/{connectionId}",
  },
  "Partner Request Update": {
    title: "Partner Connection Request {status}",
    message:
      "{recipientCompany} has {status.toLowerCase()} your partner connection request{rejectionReason ? ': ' + rejectionReason : ''}",
    priority: "High",
    actionRequired: true,
    actionLink: "/partner-connections/{connectionId}",
  },
  "Partner Connection Terminated": {
    title: "Partner Connection Terminated",
    message:
      "Your connection with {partnerCompany} has been terminated{terminationReason ? ': ' + terminationReason : ''}",
    priority: "High",
    actionRequired: true,
    actionLink: "/partner-connections/{connectionId}",
  },
  "Partner Visibility Updated": {
    title: "Partner Visibility Settings Updated",
    message:
      "{partnerCompany} has updated the visibility settings for your connection",
    priority: "Medium",
    actionRequired: false,
    actionLink: "/partner-connections/{connectionId}",
  },
  "Document Update": {
    title: "Document Update Required",
    message: "Please update the following document: {documentName}",
    priority: "Medium",
    actionRequired: true,
    actionLink: "/documents/{documentId}",
  },
  "Task Assignment": {
    title: "New Task Assigned",
    message: "You have been assigned a new task: {taskName}",
    priority: "Medium",
    actionRequired: true,
    actionLink: "/tasks/{taskId}",
  },
  "System Alert": {
    title: "System Alert",
    message: "{alertMessage}",
    priority: "Urgent",
    actionRequired: true,
    actionLink: "/alerts/{alertId}",
  },
};

class NotificationTemplateService {
  getTemplate(type) {
    if (!templates[type]) {
      throw new Error(`Template not found for notification type: ${type}`);
    }
    return templates[type];
  }

  formatMessage(template, data) {
    let message = template.message;
    let title = template.title;
    let actionLink = template.actionLink;

    // Replace placeholders in message
    Object.keys(data).forEach((key) => {
      const placeholder = `{${key}}`;
      message = message.replace(placeholder, data[key]);
      title = title.replace(placeholder, data[key]);
      if (actionLink) {
        actionLink = actionLink.replace(placeholder, data[key]);
      }
    });

    return {
      ...template,
      title,
      message,
      actionLink,
    };
  }

  createNotification(type, data, recipient) {
    const template = this.getTemplate(type);
    const formattedTemplate = this.formatMessage(template, data);

    return {
      recipient,
      type,
      ...formattedTemplate,
      sentVia: { email: false, inApp: true, sms: false },
    };
  }

  validateTemplateData(type, data) {
    const template = this.getTemplate(type);
    const requiredFields = this.extractRequiredFields(template.message);
    const missingFields = requiredFields.filter((field) => !data[field]);

    if (missingFields.length > 0) {
      throw new Error(
        `Missing required fields for template: ${missingFields.join(", ")}`
      );
    }

    return true;
  }

  extractRequiredFields(message) {
    const regex = /{([^}]+)}/g;
    const fields = [];
    let match;

    while ((match = regex.exec(message)) !== null) {
      fields.push(match[1]);
    }

    return fields;
  }
}

export default new NotificationTemplateService();
