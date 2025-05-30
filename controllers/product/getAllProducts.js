import Product from "../../models/Product.js";
import { AppError } from "../../utils/AppError.js";

export const getAllProducts = async (req, res, next) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const products = await Product.find({ company: companyId });
    res.status(200).json({ status: "success", data: products });
  } catch (err) {
    next(err);
  }
};
