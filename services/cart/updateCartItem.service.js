import Cart from "../../models/Cart.js";
import mongoose from "mongoose";

/**
 * Updates the quantity of a specific item in a cart.
 * @param {string} buyerCompanyId - The ID of the buyer's company.
 * @param {string} cartItemId - The ID of the cart item to update.
 * @param {number} quantity - The new quantity for the item.
 * @returns {Promise<Cart>} The updated cart object.
 */
export default async function updateCartItemService({
  buyerCompanyId,
  cartItemId,
  quantity,
}) {
  if (
    !mongoose.Types.ObjectId.isValid(buyerCompanyId) ||
    !mongoose.Types.ObjectId.isValid(cartItemId)
  ) {
    throw new Error("Invalid ID format");
  }

  const cart = await Cart.findOne({
    company: buyerCompanyId,
    "items._id": cartItemId,
  });

  if (!cart) {
    throw new Error("Cart or item not found");
  }

  const item = cart.items.id(cartItemId);
  if (!item) {
    throw new Error("Item not found in cart");
  }

  item.quantity = quantity;
  item.subtotal = item.quantity * item.priceAtTimeOfAddition;

  // You might want to remove the item if quantity is 0
  if (item.quantity <= 0) {
    item.remove();
  }

  // If the cart has no more items, delete the cart itself
  if (cart.items.length === 0) {
    await Cart.findByIdAndDelete(cart._id);
    return null; // Indicate cart was deleted
  }

  await cart.save();
  return cart;
}
