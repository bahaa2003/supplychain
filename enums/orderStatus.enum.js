export const orderStatus = {
  CREATED: "Created", // Employee created the order
  APPROVED: "Approved", // Manager or Admin approved the order for submission
  REJECTED: "Rejected", // Manager or Admin rejected the order
  SUBMITTED: "Submitted", // Order sent to supplier after approval
  DRAFTED: "Drafted", // Supplier cancelled the order
  CANCELLED: "Cancelled", // Customer cancelled the order after submission
  READY_TO_SHIP: "Ready_to_ship", // Order is ready for shipment
  SHIPPING: "Shipping", // Order is in transit
  DELIVERED: "Delivered", // Order has been delivered
  ACCEPTED: "Accepted", // Order has been received and accepted by the customer
  RETURNED: "Returned", // Order has been returned
  COMPLETED: "Completed", // Process is closed (e.g., a week after acceptance)
  FAILED: "Failed", // System-level failure led to order cancellation
};

export const orderStatusEnum = Object.values(orderStatus);
