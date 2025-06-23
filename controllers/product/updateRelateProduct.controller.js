import Product from "../../models/Product.js";
import { AppError } from "../../utils/AppError.js";

// PATCH /products/:id/relate/:sourceProductId
// Toggle relation: add if not present, remove if present
export const relateProduct = async (req, res, next) => {
  try {
    const { id, sourceProductId } = req.params;
    const companyId = req.user.company?._id || req.user.company;
    const product = await Product.findOne({ _id: id, company: companyId });
    if (!product) return next(new AppError("Product not found", 404));
    const source = await Product.findById(sourceProductId);
    if (!source) return next(new AppError("Source product not found", 404));

    // Toggle relation for product
    const idx = product.relatedProducts.indexOf(sourceProductId);
    if (idx === -1) {
      product.relatedProducts.push(sourceProductId);
    } else {
      product.relatedProducts.splice(idx, 1);
    }
    await product.save();

    res.status(200).json({ status: "success", data: product });
  } catch (err) {
    next(new AppError(err.message || "Failed to relate/unrelate product", 500));
  }
};
