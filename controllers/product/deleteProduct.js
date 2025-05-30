import Product from "../../models/Product.js";
import { AppError } from "../../utils/AppError.js";

export const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company?._id || req.user.company;
    const product = await Product.findOneAndDelete({
      _id: id,
      company: companyId,
    });
    if (!product) return next(new AppError("Product not found", 404));
    res.status(204).json({ status: "success", data: null });
  } catch (err) {
    next(err);
  }
};
