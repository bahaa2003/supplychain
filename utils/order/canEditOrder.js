import { orderStatus } from "../../enums/orderStatus.enum.js";

// Helper function to check if order can be edited
export const canEditOrder = (order, userCompanyId) => {
  const isEditable = [orderStatus.CREATED, orderStatus.SUBMITTED].includes(
    order.status
  );
  const isBuyer = order.buyer.toString() === userCompanyId.toString();
  return isEditable && isBuyer;
};
