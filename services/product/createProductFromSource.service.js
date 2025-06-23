import Product from "../../models/Product.js";
import Inventory from "../../models/Inventory.js";
import { AppError } from "../../utils/AppError.js";

// Create a new product for a company based on a source product
export const createProductFromSourceService = async ({
  sourceProductId,
  companyId,
  initialQuantity = 0,
}) => {
  // Find the source product
  const sourceProduct = await Product.findById(sourceProductId);
  if (!sourceProduct) {
    throw new AppError("Source product not found", 404);
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
    currentQuantity: initialQuantity,
  });

  return product;
};
