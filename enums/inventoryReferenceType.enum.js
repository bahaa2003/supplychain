// Inventory reference types
export const inventoryReferenceType = {
  ORDER: "Order",
  SHIPMENT: "Shipment",
  TRANSFER: "Transfer",
  ADJUSTMENT: "Adjustment",
  RETURN: "Return",
  PURCHASE: "Purchase",
  SALE: "Sale",
  PRODUCTION: "Production",
  CONSUMPTION: "Consumption",
  INSPECTION: "Inspection",
  SYSTEM: "System",
  MANUAL: "Manual",
};

// Array of all inventory reference types for validation
export const inventoryReferenceTypeEnum = Object.values(inventoryReferenceType);

// Reference type descriptions
export const inventoryReferenceTypeDescriptions = {
  [inventoryReferenceType.ORDER]: "Reference to an order",
  [inventoryReferenceType.SHIPMENT]: "Reference to a shipment",
  [inventoryReferenceType.TRANSFER]: "Reference to an inventory transfer",
  [inventoryReferenceType.ADJUSTMENT]: "Reference to an inventory adjustment",
  [inventoryReferenceType.RETURN]: "Reference to a return",
  [inventoryReferenceType.PURCHASE]: "Reference to a purchase",
  [inventoryReferenceType.SALE]: "Reference to a sale",
  [inventoryReferenceType.PRODUCTION]: "Reference to production",
  [inventoryReferenceType.CONSUMPTION]: "Reference to consumption",
  [inventoryReferenceType.INSPECTION]: "Reference to an inspection",
  [inventoryReferenceType.SYSTEM]: "System generated change",
  [inventoryReferenceType.MANUAL]: "Manual change without specific reference",
};
