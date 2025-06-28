export const inventoryChangeType = Object.freeze({
  INCOMING: "Incoming", // receive inventory
  OUTGOING: "Outgoing", // send inventory
  RESERVED: "Reserved", // reserve inventory
  UNRESERVED: "Unreserved", // cancel reservation
  ADJUSTMENT: "Adjustment", // manual adjustment
  DAMAGED: "Damaged", // damaged
  EXPIRED: "Expired", // expired
  RETURNED: "Returned", // return
  TRANSFER: "Transfer", // transfer between locations
});

export const inventoryChangeTypeEnum = Object.values(inventoryChangeType);
