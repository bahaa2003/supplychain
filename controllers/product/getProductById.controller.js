import Product from "../../models/Product.schema.js";
import { AppError } from "../../utils/AppError.js";

export const getProductById = async (req, res, next) => {
  try {
    const { id: productId } = req.params;
    const companyId = req.user.company?._id || req.user.company;

    const product = await Product.findOne({
      _id: productId,
      company: companyId,
    }).lean();
    if (!product) return next(new AppError("Product not found", 404));

    res.status(200).json({ status: "success", data: product });
  } catch (err) {
    next(new AppError(err.message || "Failed to get product", 500));
  }
};
