import Cart from "../../models/Cart.js";
import mongoose from "mongoose";

/**
 * Retrieves all carts for a specific buyer company.
 * Populates supplier information and product details for each cart.
 * @param {string} buyerCompanyId - The ID of the buyer's company.
 * @returns {Promise<Cart[]>} An array of cart objects.
 */
export default async function getCartsService({ buyerCompanyId }) {
  if (!mongoose.Types.ObjectId.isValid(buyerCompanyId)) {
    throw new Error("Invalid buyer company ID format");
  }

  const carts = await Cart.find({ company: buyerCompanyId })
    .populate({
      path: "supplier",
      select: "name logo", // Select fields from the Company model for the supplier
    })
    .populate({
      path: "items.product",
      select: "_id name sku unitPrice images", // Select fields from the Product model
    });

  if (!carts) {
    return []; // Return an empty array if no carts are found
  }

  return carts;
}
