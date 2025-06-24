import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";
import Inventory from "../../models/Inventory.js";
import mongoose from "mongoose";

/**
 * Validates a cart before checkout.
 * Checks for price changes and stock availability.
 * @param {string} cartId - The ID of the cart to validate.
 * @param {string} buyerCompanyId - The ID of the buyer's company.
 * @returns {Promise<object>} A validation result object.
 */
export default async function validateCartService({ cartId, buyerCompanyId }) {
  if (
    !mongoose.Types.ObjectId.isValid(cartId) ||
    !mongoose.Types.ObjectId.isValid(buyerCompanyId)
  ) {
    throw new Error("Invalid ID format");
  }

  const cart = await Cart.findOne({
    _id: cartId,
    company: buyerCompanyId,
  }).populate("items.product");

  if (!cart) {
    throw new Error("Cart not found");
  }

  const issues = [];
  let isValid = true;

  for (const item of cart.items) {
    const currentProduct = await Product.findById(item.product._id);
    if (!currentProduct) {
      issues.push({
        itemId: item._id,
        issue: "Product no longer exists.",
        productId: item.product._id,
      });
      isValid = false;
      continue;
    }

    // 1. Check for price changes
    if (item.priceAtTimeOfAddition !== currentProduct.unitPrice) {
      issues.push({
        itemId: item._id,
        issue: "Price has changed.",
        productId: item.product._id,
        oldPrice: item.priceAtTimeOfAddition,
        newPrice: currentProduct.unitPrice,
      });
      isValid = false;
    }

    // 2. Check for stock availability
    const inventory = await Inventory.findOne({
      product: item.product._id,
      company: cart.supplier, // Check supplier's inventory
    });

    if (!inventory || inventory.availableQuantity < item.quantity) {
      issues.push({
        itemId: item._id,
        issue: "Insufficient stock.",
        productId: item.product._id,
        requestedQty: item.quantity,
        availableQty: inventory ? inventory.availableQuantity : 0,
      });
      isValid = false;
    }
  }

  return {
    isValid,
    issues,
    cart,
  };
}
