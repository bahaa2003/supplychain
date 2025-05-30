import Product from "../../models/Product.js";
import { AppError } from "../../utils/AppError.js";

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company?._id || req.user.company;
    const product = await Product.findOneAndUpdate(
      { _id: id, company: companyId },
      req.body,
      { new: true }
    );
    if (!product) return next(new AppError("Product not found", 404));
    res.status(200).json({ status: "success", data: product });
  } catch (err) {
    next(err);
  }
};
