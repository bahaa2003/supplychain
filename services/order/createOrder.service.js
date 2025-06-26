import mongoose from "mongoose";
import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import Inventory from "../../models/Inventory.js";
import InventoryHistory from "../../models/InventoryHistory.js";
import { AppError } from "../../utils/AppError.js";
import { httpStatusText } from "../../utils/httpStatusText.js";
import { inventoryChangeType } from "../../enums/inventoryChangeType.enum.js";
import { inventoryReferenceType } from "../../enums/inventoryReferenceType.enum.js";
import { orderStatus } from "../../enums/orderStatus.enum.js";
import { generateOrderNumber } from "../../utils/orderNumber.js";

/**
 * Creates a new order and manages inventory in a transaction.
 * @param {object} orderData - The data for the new order.
 * @param {string} orderData.supplierId - The ID of the supplier company.
 * @param {string} orderData.deliveryLocationId - The ID of the delivery location.
 * @param {Array<object>} orderData.items - The items to be included in the order.
 * @param {string} orderData.items.productId - The ID of the product.
 * @param {number} orderData.items.quantity - The quantity of the product.
 * @param {string} [orderData.notes] - Optional notes for the order.
 * @param {Date} [orderData.requestedDeliveryDate] - Optional requested delivery date.
 * @param {object} user - The user creating the order.
 * @param {string} user._id - The ID of the user.
 * @param {string} user.companyId - The ID of the user's company (the buyer).
 * @returns {Promise<Order>} The newly created order document.
 */
export const createOrderService = async (orderData, user) => {
  const {
    supplierId,
    deliveryLocationId,
    items,
    notes,
    requestedDeliveryDate,
  } = orderData;
  const buyerId = user.companyId;
  const userId = user._id;

  if (!supplierId || !deliveryLocationId || !items || items.length === 0) {
    throw new AppError(
      "Supplier, delivery location, and at least one item are required.",
      400,
      httpStatusText.FAIL
    );
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const orderItems = [];
    let totalAmount = 0;
    const historyToCreate = [];

    for (const item of items) {
      const product = await Product.findOne({
        _id: item.productId,
        company: supplierId,
        isActive: true,
      }).session(session);

      if (!product) {
        throw new AppError(
          `Product with ID ${item.productId} not found or is inactive for the selected supplier.`,
          404,
          httpStatusText.FAIL
        );
      }

      // Find an inventory location for the supplier that can fulfill the order item quantity
      const inventoryToUpdate = await Inventory.findOne({
        product: product._id,
        company: supplierId,
        $expr: {
          $gte: [{ $subtract: ["$onHand", "$reserved"] }, item.quantity],
        },
      }).session(session);

      if (!inventoryToUpdate) {
        throw new AppError(
          `Insufficient stock for product: ${product.name}. Check supplier inventory.`,
          400,
          httpStatusText.FAIL
        );
      }

      const subtotal = product.unitPrice * item.quantity;
      orderItems.push({
        productId: product._id,
        sku: product.sku,
        name: product.name,
        quantity: item.quantity,
        unitPrice: product.unitPrice,
        subtotal,
      });

      totalAmount += subtotal;

      const oldInventory = {
        onHand: inventoryToUpdate.onHand,
        reserved: inventoryToUpdate.reserved,
      };
      inventoryToUpdate.reserved += item.quantity;
      await inventoryToUpdate.save({ session });

      historyToCreate.push({
        inventory: inventoryToUpdate._id,
        company: supplierId,
        product: product._id,
        changeType: inventoryChangeType.RESERVATION,
        quantityChange: { reserved: +item.quantity },
        before: oldInventory,
        after: {
          onHand: inventoryToUpdate.onHand,
          reserved: inventoryToUpdate.reserved,
        },
        reason: "Order creation reservation",
        referenceType: inventoryReferenceType.ORDER,
        referenceId: null, // Placeholder
        performedBy: userId,
      });
    }

    const orderNumber = await generateOrderNumber();

    const newOrderArray = await Order.create(
      [
        {
          orderNumber,
          buyer: buyerId,
          supplier: supplierId,
          createdBy: userId,
          status: orderStatus.CREATED,
          items: orderItems,
          totalAmount,
          deliveryLocation: deliveryLocationId,
          notes,
          requestedDeliveryDate,
        },
      ],
      { session }
    );

    const newOrder = newOrderArray[0];

    // Update inventory history with the new order's ID
    for (const historyItem of historyToCreate) {
      historyItem.referenceId = newOrder._id;
    }
    await InventoryHistory.insertMany(historyToCreate, { session });

    await session.commitTransaction();
    session.endSession();

    return newOrder;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(
      "Failed to create order due to an internal error.",
      500,
      httpStatusText.ERROR,
      error.message
    );
  }
};
