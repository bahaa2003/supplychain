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
  COMPLETED: "Completed", // completed
  CANCELLED: "Cancelled", // cancelled
};

export const orderStatusEnum = Object.values(orderStatus);

// Valid status transitions
export const VALID_ORDER_TRANSITIONS = {
  [orderStatus.CREATED]: [orderStatus.REJECTED, orderStatus.SUBMITTED],
  [orderStatus.REJECTED]: [orderStatus.SUBMITTED],
  [orderStatus.SUBMITTED]: [
    orderStatus.ACCEPTED,
    orderStatus.DECLINED,
    orderStatus.CANCELLED,
  ],
  [orderStatus.ACCEPTED]: [
    orderStatus.PREPARING,
    orderStatus.CANCELLED,
    orderStatus.DECLINED,
  ],
  [orderStatus.PREPARING]: [orderStatus.READY_TO_SHIP],
  [orderStatus.READY_TO_SHIP]: [orderStatus.SHIPPED],
  [orderStatus.SHIPPED]: [orderStatus.DELIVERED],
  [orderStatus.DELIVERED]: [orderStatus.RECEIVED],
  [orderStatus.RECEIVED]: [orderStatus.COMPLETED],
  [orderStatus.DECLINED]: [],
  [orderStatus.COMPLETED]: [],
  [orderStatus.CANCELLED]: [],
};

// Role permissions for status changes
export const ORDER_ROLE_PERMISSIONS = {
  buyer: {
    [orderStatus.CREATED]: [orderStatus.REJECTED, orderStatus.SUBMITTED],
    [orderStatus.SUBMITTED]: [orderStatus.CANCELLED],
    [orderStatus.ACCEPTED]: [orderStatus.CANCELLED],
    [orderStatus.REJECTED]: [orderStatus.SUBMITTED],
    [orderStatus.DELIVERED]: [orderStatus.RECEIVED],
    [orderStatus.RECEIVED]: [orderStatus.COMPLETED],
  },
  supplier: {
    [orderStatus.SUBMITTED]: [orderStatus.ACCEPTED, orderStatus.DECLINED],
    [orderStatus.ACCEPTED]: [orderStatus.PREPARING, orderStatus.DECLINED],
    [orderStatus.PREPARING]: [orderStatus.READY_TO_SHIP],
    [orderStatus.READY_TO_SHIP]: [orderStatus.SHIPPED],
    [orderStatus.SHIPPED]: [orderStatus.DELIVERED],
    // [orderStatus.RECEIVED]: [orderStatus.COMPLETED],
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

  // when the return is processed - add to the supplier's inventory
  [orderStatus.RETURN_PROCESSED]: {
    supplier: { add: true },
  },

  // when the order is cancelled - cancel the reservation
  [orderStatus.CANCELLED]: {
    supplier: { unreserve: true },
  },

  // when the order is declined - cancel the reservation
  [orderStatus.DECLINED]: {
    supplier: { unreserve: true },
  },
};
