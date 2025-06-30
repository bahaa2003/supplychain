import { fixOrderIssuesService } from "../../services/orderValidation.service.js";

export const fixOrderIssues = async (req, res) => {
  const { orderId } = req.params;
  const userCompanyId = req.user.company?._id || req.user.company;

  const result = await fixOrderIssuesService(orderId, userCompanyId);

  res.json({
    status: "success",
    message: "Order issues fixed successfully",
    data: result,
  });
};
