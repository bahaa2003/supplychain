export const inventoryChangeType = {
  INITIAL: "Initial", // Initial stock count
  ADJUSTMENT: "Adjustment", // Manual adjustment
  SALE: "Sale", // Stock deducted upon shipment
  RETURN: "Return", // Stock added back from a return
  RESERVED: "Reserved", // Stock reserved for an approved order
  RESERVATION_CANCELLED: "Reservation_Cancelled", // Stock released from a cancelled/rejected order
  TRANSFER: "Transfer", // Stock moved between locations
};

export const inventoryChangeTypeEnum = Object.values(inventoryChangeType);
