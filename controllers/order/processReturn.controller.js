import Order from "../../models/Order.js";
import Inventory from "../../models/Inventory.js";
import InventoryHistory from "../../models/InventoryHistory.js";
import { AppError } from "../../utils/AppError.js";
import { orderStatus } from "../../enums/orderStatus.enum.js";
import { inventoryChangeType } from "../../enums/inventoryChangeType.enum.js";
import { inventoryReferenceType } from "../../enums/inventoryReferenceType.enum.js";

export const processReturn = async (req, res) => {
  const { orderId } = req.params;
  const {
    acceptedItems, // accepted items
    rejectedItems, // rejected items
    processingNotes,
  } = req.body;
  const userId = req.user._id;
  const userCompanyId = req.user.company;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // check if the user is the supplier
  if (order.supplier.toString() !== userCompanyId.toString()) {
    throw new AppError("You can only process returns for your own orders", 403);
  }

  // check if the order is in the returned status
  if (order.status !== orderStatus.RETURNED) {
    throw new AppError("Order is not in returned status", 400);
  }

  // process the accepted items - add to the supplier's inventory
  for (const acceptedItem of acceptedItems) {
    const supplierInventory = await Inventory.findOne({
      product: acceptedItem.productId,
      company: order.supplier,
    });

    if (supplierInventory) {
      const before = {
        onHand: supplierInventory.onHand,
        reserved: supplierInventory.reserved,
      };

      supplierInventory.onHand += acceptedItem.quantity;

      const after = {
        onHand: supplierInventory.onHand,
        reserved: supplierInventory.reserved,
      };

      await supplierInventory.save();

      // log the inventory history
      await InventoryHistory.create({
        inventory: supplierInventory._id,
        company: order.supplier,
        product: acceptedItem.productId,
        changeType: inventoryChangeType.INCOMING,
        quantityChange: {
          onHand: acceptedItem.quantity,
          reserved: 0,
        },
        before,
        after,
        reason: `Return processed - accepted: ${
          acceptedItem.reason || "No specific reason"
        }`,
        referenceType: inventoryReferenceType.RETURN,
        referenceId: order._id,
        performedBy: userId,
      });
    }
  }

  // update the return processing information
  order.returnProcessing = {
    acceptedItems,
    rejectedItems,
    processingNotes,
    processedBy: userId,
    processedAt: new Date(),
  };

  // update the order status
  order.status = orderStatus.RETURN_PROCESSED;

  order.history.push({
    status: orderStatus.RETURN_PROCESSED,
    updatedBy: userId,
    notes: `Return processed: ${acceptedItems.length} accepted, ${
      rejectedItems.length
    } rejected. ${processingNotes || ""}`,
  });

  await order.save();

  await order.populate([
    { path: "buyer", select: "name" },
    { path: "supplier", select: "name" },
    { path: "returnProcessing.processedBy", select: "name" },
  ]);

  res.json({
    status: "success",
    message: "Return processed successfully. Supplier inventory updated.",
    data: { order },
  });
};
