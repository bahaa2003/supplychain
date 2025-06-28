import Order from "../../models/Order.js";
import Inventory from "../../models/Inventory.js";
import InventoryHistory from "../../models/InventoryHistory.js";
import { AppError } from "../../utils/AppError.js";
import { orderStatus } from "../../enums/orderStatus.enum.js";
import { inventoryChangeType } from "../../enums/inventoryChangeType.enum.js";
import { inventoryReferenceType } from "../../enums/inventoryReferenceType.enum.js";

export const returnOrder = async (req, res) => {
  const { orderId } = req.params;
  const { returnItems, returnReason, isPartialReturn = false } = req.body;
  const userId = req.user._id;
  const userCompanyId = req.user.company?._id || req.user.company;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // check if the user is the buyer
  if (order.buyer.toString() !== userCompanyId.toString()) {
    throw new AppError("You can only return your own orders", 403);
  }

  // check if the order is in the delivered or received status
  if (![orderStatus.DELIVERED, orderStatus.RECEIVED].includes(order.status)) {
    throw new AppError("Order cannot be returned in current status", 400);
  }

  // process the return immediately
  for (const returnItem of returnItems) {
    const orderItem = order.items.find(
      (item) => item.productId.toString() === returnItem.productId.toString()
    );

    if (!orderItem) {
      throw new AppError(
        `Product ${returnItem.productId} not found in order`,
        400
      );
    }

    if (returnItem.quantity > orderItem.quantity) {
      throw new AppError(
        `Return quantity (${returnItem.quantity}) cannot exceed ordered quantity (${orderItem.quantity})`,
        400
      );
    }

    // deduct from the buyer's inventory immediately
    const buyerInventory = await Inventory.findOne({
      product: returnItem.productId,
      company: order.buyer,
    });

    if (buyerInventory) {
      const before = {
        onHand: buyerInventory.onHand,
        reserved: buyerInventory.reserved,
      };

      buyerInventory.onHand = Math.max(
        0,
        buyerInventory.onHand - returnItem.quantity
      );

      const after = {
        onHand: buyerInventory.onHand,
        reserved: buyerInventory.reserved,
      };

      await buyerInventory.save();

      // log the inventory history
      await InventoryHistory.create({
        inventory: buyerInventory._id,
        company: order.buyer,
        product: returnItem.productId,
        changeType: inventoryChangeType.OUTGOING,
        quantityChange: {
          onHand: -returnItem.quantity,
          reserved: 0,
        },
        before,
        after,
        reason: `Order return: ${returnReason}`,
        referenceType: inventoryReferenceType.RETURN,
        referenceId: order._id,
        performedBy: userId,
      });
    }
  }

  // update the order status
  order.status = orderStatus.RETURNED;
  order.returnInfo = {
    returnItems,
    returnReason,
    isPartialReturn,
    returnedBy: userId,
    returnedAt: new Date(),
  };

  order.history.push({
    status: orderStatus.RETURNED,
    updatedBy: userId,
    notes: `Order returned: ${returnReason}${
      isPartialReturn ? " (Partial)" : " (Full)"
    }`,
  });

  await order.save();

  await order.populate([
    { path: "buyer", select: "name" },
    { path: "supplier", select: "name" },
    { path: "returnInfo.returnedBy", select: "name" },
  ]);

  res.json({
    status: "success",
    message: "Order returned successfully. Inventory updated immediately.",
    data: { order },
  });
};
