import Order from "../../models/Order.js";
import Inventory from "../../models/Inventory.js";
import InventoryHistory from "../../models/InventoryHistory.js";
import { AppError } from "../../utils/AppError.js";
import {
  canTransitionTo,
  INVENTORY_IMPACT,
  orderStatus,
} from "../../enums/orderStatus.enum.js";
import { inventoryChangeType } from "../../enums/inventoryChangeType.enum.js";
import { inventoryReferenceType } from "../../enums/inventoryReferenceType.enum.js";

export const updateOrder = async (req, res) => {
  const { orderId } = req.params;
  const { status: newStatus, notes, confirmedDeliveryDate } = req.body;
  const userId = req.user._id;
  const userCompanyId = req.user.company;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  const currentStatus = order.status;

  // check if the transition is valid
  if (
    !canTransitionTo(
      currentStatus,
      newStatus,
      req.user.role,
      userCompanyId,
      order
    )
  ) {
    throw new AppError("Invalid status transition", 400);
  }

  // check if the order has issues
  if (newStatus === orderStatus.APPROVED && order.issues.length > 0) {
    throw new AppError(
      "Cannot approve order with unresolved issues. Please validate items first.",
      400
    );
  }

  // process the inventory impact
  await handleInventoryImpact(order, currentStatus, newStatus, userId);

  // update the order status
  order.status = newStatus;

  if (confirmedDeliveryDate) {
    order.confirmedDeliveryDate = confirmedDeliveryDate;
  }

  // add to the history
  order.history.push({
    status: newStatus,
    updatedBy: userId,
    notes: notes || `Status changed from ${currentStatus} to ${newStatus}`,
  });

  await order.save();

  await order.populate([
    { path: "buyer", select: "name" },
    { path: "supplier", select: "name" },
    { path: "history.updatedBy", select: "name" },
  ]);

  res.json({
    status: "success",
    message: "Order updated successfully",
    data: { order },
  });
};

// process the inventory impact
const handleInventoryImpact = async (
  order,
  currentStatus,
  newStatus,
  userId
) => {
  const impact = INVENTORY_IMPACT[newStatus];
  if (!impact) return;

  for (const item of order.items) {
    // effect on the supplier's inventory
    if (impact.supplier) {
      const supplierInventory = await Inventory.findOne({
        product: item.productId,
        company: order.supplier,
      });

      if (supplierInventory) {
        await updateInventory(
          supplierInventory,
          item,
          impact.supplier,
          userId,
          order._id,
          `Order ${newStatus.toLowerCase()}`
        );
      }
    }

    // effect on the buyer's inventory
    if (impact.buyer) {
      const buyerInventory = await Inventory.findOne({
        product: item.productId,
        company: order.buyer,
      });

      if (buyerInventory || impact.buyer.add) {
        await updateInventory(
          buyerInventory,
          item,
          impact.buyer,
          userId,
          order._id,
          `Order ${newStatus.toLowerCase()}`
        );
      }
    }
  }
};

// update the inventory
const updateInventory = async (
  inventory,
  item,
  impact,
  userId,
  orderId,
  reason
) => {
  let inventoryExists = !!inventory;

  if (!inventory) {
    // create a new inventory if it doesn't exist (for the buyer when received)
    inventory = new Inventory({
      product: item.productId,
      company: impact.add ? order.buyer : order.supplier,
      location: order.deliveryLocation, // or a default location
      onHand: 0,
      reserved: 0,
    });
  }

  const before = {
    onHand: inventory.onHand,
    reserved: inventory.reserved,
  };

  const quantityChange = { onHand: 0, reserved: 0 };

  if (impact.reserve) {
    inventory.reserved += item.quantity;
    quantityChange.reserved = item.quantity;
  }

  if (impact.unreserve) {
    inventory.reserved = Math.max(0, inventory.reserved - item.quantity);
    quantityChange.reserved = -item.quantity;
  }

  if (impact.deduct) {
    inventory.onHand = Math.max(0, inventory.onHand - item.quantity);
    quantityChange.onHand = -item.quantity;
  }

  if (impact.add) {
    inventory.onHand += item.quantity;
    quantityChange.onHand = item.quantity;
  }

  const after = {
    onHand: inventory.onHand,
    reserved: inventory.reserved,
  };

  await inventory.save();

  // log the inventory history
  await InventoryHistory.create({
    inventory: inventory._id,
    company: inventory.company,
    product: item.productId,
    changeType: getChangeType(impact),
    quantityChange,
    before,
    after,
    reason,
    referenceType: inventoryReferenceType.ORDER,
    referenceId: orderId,
    performedBy: userId,
  });
};

// determine the change type
const getChangeType = (impact) => {
  if (impact.add) return inventoryChangeType.INCOMING;
  if (impact.deduct) return inventoryChangeType.OUTGOING;
  if (impact.reserve) return inventoryChangeType.RESERVED;
  if (impact.unreserve) return inventoryChangeType.UNRESERVED;
  return inventoryChangeType.ADJUSTMENT;
};
