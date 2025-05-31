import Product from "../../models/Product.js";

export const createProduct = async (req, res, next) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const product = await Product.create({ ...req.body, company: companyId });
    res.status(201).json({ status: "success", data: product });
  } catch (err) {
    next(new AppError(err.message || "Failed to create product", 500));
  }
};
