import Product from "../../models/Product.js";
import { AppError } from "../../utils/AppError.js";
// generate sku function
const generateSku = () => {
  return `SKU-${Math.random().toString(36).substring(2, 14).toUpperCase()}`;
};
export const createProduct = async (req, res, next) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    // check if name is unique the give apperror if exist
    const existingProduct = await Product.findOne({
      name: req.body.name,
      company: companyId, // ensure the product belongs to the same company
    });
    if (existingProduct) {
      return next(new AppError("Product with this name already exists", 400));
    }
    const product = await Product.create({
      ...req.body,
      company: req.user.company._id,
      sku: generateSku(),
      company: companyId,
    });
    product.__v = undefined; // remove __v field from the response
    res.status(201).json({ status: "success", data: product });
  } catch (err) {
    next(new AppError(err.message || "Failed to create product", 500));
  }
};
