import getCompanyOrdersService from "../../services/order/getCompanyOrders.service.js";
import { AppError } from "../../utils/AppError.js";

const getAllOrder = async (req, res, next) => {
  const companyId = req.user.companyId;
  const {
    direction, // sent | received | undefined
    filterCompanyId,
    from,
    to,
    page = 1,
    limit = 20,
  } = req.query;
  try {
    const result = await getCompanyOrdersService({
      companyId,
      direction,
      filterCompanyId,
      from,
      to,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
    return res.status(200).json({
      status: "success",
      message: "Orders fetched successfully.",
      data: {
        orders: result.orders,
        page: result.page,
        limit: parseInt(limit, 10),
        total: result.total,
        totalPages: result.totalPages,
      },
    });
  } catch (error) {
    return next(new AppError(error.message || "Failed to fetch orders", 500));
  }
};

export default getAllOrder;
