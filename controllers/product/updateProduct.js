import Product from "../../models/Product.js";
import { AppError } from "../../utils/AppError.js";

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company?._id || req.user.company;
    if (req.body.name) {
      // check if name is unique the give apperror if exist
      const existingProduct = await Product.findOne({
        name: req.body.name,
        company: companyId, // ensure the product belongs to the same company
      });
      if (existingProduct) {
        return next(new AppError("Product with this name already exists", 400));
      }
    }
    const product = await Product.findOneAndUpdate(
      { _id: id, company: companyId },
      req.body,
      { new: true }
    ).select({
      __v: false, // exclude __v field from the response
    });
    if (!product) return next(new AppError("Product not found", 404));
    res.status(200).json({ status: "success", data: product });
  } catch (err) {
    next(new AppError(err.message || "failed to update product", 500));
  }
};
