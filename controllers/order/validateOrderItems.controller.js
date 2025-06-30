import { validateOrderItemsService } from "./../../services/orderValidation.service.js";
export const validateOrderItems = async (req, res) => {
  const { orderId } = req.params;
  const userCompanyId = req.user.company?._id || req.user.company;

  const result = await validateOrderItemsService(orderId, userCompanyId);

  res.json({
    status: "success",
    message: result.hasIssues
      ? "Issues found in order items"
      : "All items validated successfully",
    data: result,
  });
};
