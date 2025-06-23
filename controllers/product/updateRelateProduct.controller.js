import { relateProductService } from "../../services/product/relateProduct.service.js";
import { AppError } from "../../utils/AppError.js";

// PATCH /products/:id/relate/:sourceProductId
export const relateProduct = async (req, res, next) => {
  try {
    const { id, sourceProductId } = req.params;
    const companyId = req.user.company?._id || req.user.company;

    const product = await relateProductService({
      id,
      sourceProductId,
      companyId,
    });

    res.status(200).json({ status: "success", data: product });
  } catch (err) {
    next(new AppError(err.message || "Failed to relate/unrelate product", 500));
  }
};
