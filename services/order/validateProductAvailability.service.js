import Inventory from "../../models/Inventory.schema.js";
import Product from "../../models/Product.schema.js";
import { AppError } from "../../utils/AppError.js";

// Helper function to validate product availability
export const validateProductAvailability = async (
  sku,
  supplierId,
  quantity
) => {
  const supplierProduct = await Product.findOne({
    sku,
    company: supplierId,
    isActive: true,
  });

  if (!supplierProduct) {
    throw new AppError(`Product ${sku} not found or inactive at supplier`, 400);
  }

  const supplierInventory = await Inventory.findOne({
    product: supplierProduct._id,
    company: supplierId,
  });

  if (!supplierInventory || supplierInventory.onHand < quantity) {
    throw new AppError(`Insufficient inventory for product ${sku}`, 400);
  }

  return supplierProduct;
};
