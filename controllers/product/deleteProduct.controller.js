import Product from "../../models/Product.schema.js";
import { AppError } from "../../utils/AppError.js";

export const deleteProduct = async (req, res, next) => {
  try {
    const { id: productId } = req.params;
    const companyId = req.user.company?._id || req.user.company;
    const product = await Product.findOneAndDelete({
      _id: productId,
      company: companyId,
    });
    if (!product) return next(new AppError("Product not found", 404));
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    next(new AppError(err.message || "Failed to delete product", 500));
  }
};
