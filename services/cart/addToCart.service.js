import Cart from "../../models/Cart.js";
import Product from "../../models/Product.js";
import mongoose from "mongoose";

/**
 * Adds a product to a cart or updates its quantity if it already exists.
 * Creates a new cart if one doesn't exist for the buyer-supplier pair.
 * @param {string} buyerCompanyId - The ID of the buyer's company.
 * @param {string} productId - The ID of the product to add.
 * @param {number} quantity - The quantity of the product to add.
 * @returns {Promise<Cart>} The updated cart object.
 */
export default async function addToCartService({
  buyerCompanyId,
  productId,
  quantity,
}) {
  if (
    !mongoose.Types.ObjectId.isValid(buyerCompanyId) ||
    !mongoose.Types.ObjectId.isValid(productId)
  ) {
    throw new Error("Invalid ID format");
  }

  const product = await Product.findById(productId);
  if (!product) {
    throw new Error("Product not found");
  }

  const supplierCompanyId = product.company;

  let cart = await Cart.findOne({
    company: buyerCompanyId,
    supplier: supplierCompanyId,
  });

  if (!cart) {
    cart = new Cart({
      company: buyerCompanyId,
      supplier: supplierCompanyId,
      items: [],
    });
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    // Product exists, update quantity
    cart.items[existingItemIndex].quantity += quantity;
    cart.items[existingItemIndex].subtotal =
      cart.items[existingItemIndex].quantity *
      cart.items[existingItemIndex].priceAtTimeOfAddition;
  } else {
    // Product does not exist, add new item
    const subtotal = quantity * product.unitPrice;
    cart.items.push({
      product: productId,
      quantity,
      priceAtTimeOfAddition: product.unitPrice,
      subtotal,
    });
  }

  // Recalculate total amount if necessary (or handle it separately)
  // For now, let's assume subtotal is sufficient on a per-item basis

  await cart.save();
  return cart;
}
