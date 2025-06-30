import {
  VALID_ORDER_TRANSITIONS,
  ORDER_ROLE_PERMISSIONS,
} from "../enums/orderStatus.enum.js";

// Helper function to check if transition is valid

export const checkOrderStatusTransition = (
  currentStatus,
  newStatus,
  userCompany,
  order
) => {
  // Check if transition is valid
  if (!VALID_ORDER_TRANSITIONS[currentStatus]?.includes(newStatus)) {
    return false;
  }

  // Determine user's role in this order
  const isBuyer = userCompany.toString() === order.buyer.toString();
  const isSupplier = userCompany.toString() === order.supplier.toString();

  if (!isBuyer && !isSupplier) {
    return false;
  }

  const role = isBuyer ? "buyer" : "supplier";

  // Check role permissions
  return (
    ORDER_ROLE_PERMISSIONS[role]?.[currentStatus]?.includes(newStatus) || false
  );
};
