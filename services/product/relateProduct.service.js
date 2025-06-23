import Product from "../../models/Product.js";
import { AppError } from "../../utils/AppError.js";

// Toggle relation between two products (add if not present, remove if present)
export const relateProductService = async ({
  sourceProductId,
  companyId,
  id,
}) => {
  const product = await Product.findOne({ _id: id, company: companyId });
  if (!product) throw new AppError("Product not found", 404);

  const source = await Product.findById(sourceProductId);
  if (!source) throw new AppError("Source product not found", 404);

  // Toggle relation for product
  const idx = product.relatedProducts.indexOf(sourceProductId);
  if (idx === -1) {
    product.relatedProducts.push(sourceProductId);
  } else {
    product.relatedProducts.splice(idx, 1);
  }
  await product.save();

  return product;
};
