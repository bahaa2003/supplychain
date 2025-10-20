import Inventory from "../../models/Inventory.schema.js";
import { AppError } from "../../utils/AppError.js";

// Helper function to validate product availability
export const validateProductAvailability = async (
  sku,
  supplierId,
  quantity
) => {
  const supplierInventory = await Inventory.findOne({
    sku,
    company: supplierId,
    isActive: true,
    product: supplierProduct._id,
    company: supplierId,
  });

  if (!supplierProduct) {
    throw new AppError(`Product ${sku} not found or inactive at supplier`, 400);
  }
  if (supplierInventory.available < quantity) {
    throw new AppError(`Insufficient inventory for product ${sku}`, 400);
  }

  return supplierProduct;
};
