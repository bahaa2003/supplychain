import { createProductFromSourceService } from "../../services/product/createProductFromSource.service.js";
import { AppError } from "../../utils/AppError.js";

export const createProductFromSource = async (req, res, next) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const { sourceProductId } = req.params;
    const initialQuantity = req.body.initialQuantity || 0;

    const product = await createProductFromSourceService({
      sourceProductId,
      companyId,
      initialQuantity,
    });

    res.status(201).json({ status: "success", data: { product } });
  } catch (err) {
    next(
      new AppError(err.message || "Failed to create product from source", 500)
    );
  }
};
