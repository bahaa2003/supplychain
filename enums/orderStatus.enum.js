export const orderStatus = {
  CREATED: "Created", // employee created the order
  REJECTED: "Rejected", // manager rejected the order
  SUBMITTED: "Submitted", // order submitted to the supplier
  ACCEPTED: "Accepted", // supplier accepted the order
  DECLINED: "Declined", // supplier declined the order
  PREPARING: "Preparing", // supplier is preparing the order
  READY_TO_SHIP: "Ready_to_ship", // ready to ship
  SHIPPED: "Shipped", // shipped
  DELIVERED: "Delivered", // delivered
  RECEIVED: "Received", // received
  // RETURNED: "Returned", // returned
  // RETURN_PROCESSED: "Return_processed", // supplier processed the return
  COMPLETED: "Completed", // completed
  CANCELLED: "Cancelled", // cancelled
  FAILED: "Failed", // failed
};

export const orderStatusEnum = Object.values(orderStatus);

// Valid status transitions
export const VALID_ORDER_TRANSITIONS = {
  [orderStatus.CREATED]: [
    orderStatus.REJECTED,
    orderStatus.CANCELLED,
    orderStatus.SUBMITTED,
  ],
  [orderStatus.REJECTED]: [orderStatus.CREATED, orderStatus.CANCELLED], // re-adjustment
  [orderStatus.SUBMITTED]: [
    orderStatus.ACCEPTED,
    orderStatus.DECLINED,
    orderStatus.CANCELLED,
  ],
  [orderStatus.ACCEPTED]: [orderStatus.PREPARING, orderStatus.CANCELLED],
  [orderStatus.DECLINED]: [orderStatus.CANCELLED],
  [orderStatus.PREPARING]: [orderStatus.READY_TO_SHIP, orderStatus.CANCELLED],
  [orderStatus.READY_TO_SHIP]: [orderStatus.SHIPPED, orderStatus.CANCELLED],
  [orderStatus.SHIPPED]: [orderStatus.DELIVERED, orderStatus.FAILED],
  [orderStatus.DELIVERED]: [
    orderStatus.RECEIVED,
    // orderStatus.RETURNED,
    orderStatus.FAILED,
  ],
  [orderStatus.RECEIVED]: [orderStatus.COMPLETED /*orderStatus.RETURNED*/],
  // [orderStatus.RETURNED]: [orderStatus.RETURN_PROCESSED],
  [orderStatus.RETURN_PROCESSED]: [orderStatus.COMPLETED],
  [orderStatus.COMPLETED]: [],
  [orderStatus.CANCELLED]: [],
  [orderStatus.FAILED]: [orderStatus.CANCELLED],
};

// Role permissions for status changes
export const ORDER_ROLE_PERMISSIONS = {
  buyer: {
    [orderStatus.CREATED]: [
      orderStatus.REJECTED,
      orderStatus.CANCELLED,
      orderStatus.SUBMITTED,
    ],
    [orderStatus.SUBMITTED]: [orderStatus.CANCELLED],
    [orderStatus.REJECTED]: [orderStatus.CREATED, orderStatus.CANCELLED],
    [orderStatus.DELIVERED]: [orderStatus.RECEIVED /*orderStatus.RETURNED*/],
    [orderStatus.RECEIVED]: [orderStatus.COMPLETED /*orderStatus.RETURNED*/],
  },
  supplier: {
    [orderStatus.SUBMITTED]: [orderStatus.ACCEPTED, orderStatus.DECLINED],
    [orderStatus.ACCEPTED]: [orderStatus.PREPARING, orderStatus.CANCELLED],
    [orderStatus.PREPARING]: [orderStatus.READY_TO_SHIP, orderStatus.CANCELLED],
    [orderStatus.READY_TO_SHIP]: [orderStatus.SHIPPED, orderStatus.CANCELLED],
    [orderStatus.SHIPPED]: [orderStatus.DELIVERED],
    // [orderStatus.RETURNED]: [orderStatus.RETURN_PROCESSED],
  },
};

// Inventory impact points
export const INVENTORY_IMPACT = {
  // when the supplier accepts the order - reserve the quantity
  [orderStatus.SUBMITTED]: {
    supplier: { reserve: true },
  },

  // when the order is shipped - deduct from the inventory
  [orderStatus.PREPARING]: {
    supplier: { deduct: true, unreserve: true },
  },

  // when the order is received - add to the inventory
  [orderStatus.RECEIVED]: {
    buyer: { add: true },
  },

  // when the order is returned - deduct from the buyer's inventory
  // [orderStatus.RETURNED]: {
  //   buyer: { deduct: true },
  // },

  // when the return is processed - add to the supplier's inventory
  // [orderStatus.RETURN_PROCESSED]: {
  //   supplier: { add: true },
  // },

  // when the order is cancelled - cancel the reservation
  [orderStatus.CANCELLED]: {
    supplier: { unreserve: true },
  },
};
