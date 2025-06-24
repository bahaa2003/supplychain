import Cart from "../../models/Cart.js";
import mongoose from "mongoose";

/**
 * Removes a specific item from a cart.
 * If the cart becomes empty, it deletes the cart.
 * @param {string} buyerCompanyId - The ID of the buyer's company.
 * @param {string} cartItemId - The ID of the cart item to remove.
 * @returns {Promise<Cart|null>} The updated cart object or null if the cart was deleted.
 */
export default async function removeCartItemService({
  buyerCompanyId,
  cartItemId,
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

  cart.items.id(cartItemId).remove();

  // If the cart has no more items, delete the cart itself
  if (cart.items.length === 0) {
    await Cart.findByIdAndDelete(cart._id);
    return null; // Indicate cart was deleted
  }

  await cart.save();
  return cart;
}
