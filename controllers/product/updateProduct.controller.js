import Product from "../../models/Product.schema.js";
import { AppError } from "../../utils/AppError.js";

export const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company?._id || req.user.company;
    const { productName, sku, ...updateData } = req.body;

    const product = await Product.findOne({ _id: id, company: companyId });
    if (!product) return next(new AppError("Product not found", 404));

    if (productName || sku) {
      const isDuplicate = await Product.findOne({
        $or: [{ productName }, { sku }],
        company: companyId,
        _id: { $ne: id },
      });
      if (isDuplicate && isDuplicate.productName === productName)
        return next(new AppError("Product with this name already exists", 400));
      if (isDuplicate && isDuplicate.sku === sku)
        return next(new AppError("Product with this SKU already exists", 400));
      updateData.productName = productName;
    }

    const updated = await Product.findOneAndUpdate(
      { _id: id, company: companyId },
      updateData,
      { new: true, select: { __v: 0 } }
    );

    return res.status(200).json({ status: "success", data: updated });
  } catch (err) {
    next(new AppError(err.message || "Failed to update product", 500));
  }
};
