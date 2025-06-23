import Product from "../../models/Product.js";
import Inventory from "../../models/Inventory.js";
import { AppError } from "../../utils/AppError.js";

export const createProductFromSource = async (req, res, next) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const { sourceProductId } = req.params;
    // Find the source product
    const sourceProduct = await Product.findById(sourceProductId);
    if (!sourceProduct) {
      return next(new AppError("Source product not found", 404));
    }
    // Create a new product for this company with the same base info
    const product = await Product.create({
      name: sourceProduct.name,
      company: companyId,
      sku: `SKU-${Math.random().toString(36).substring(2, 14).toUpperCase()}`,
      description: sourceProduct.description,
      unit: sourceProduct.unit,
      weight: sourceProduct.weight,
      dimensions: sourceProduct.dimensions,
      tags: sourceProduct.tags,
      relatedProducts: [sourceProduct._id],
    });

    await Inventory.create({
      product: product._id,
      company: companyId,
      currentQuantity: req.body.initialQuantity || 0,
    });
    res.status(201).json({ status: "success", data: { product } });
  } catch (err) {
    next(
      new AppError(err.message || "Failed to create product from source", 500)
    );
  }
};
