import Order from "../../models/Order.schema.js";
import Inventory from "../../models/Inventory.schema.js";
import InventoryHistory from "../../models/InventoryHistory.schema.js";
import { AppError } from "../../utils/AppError.js";
import { canEditOrder } from "../../utils/order/canEditOrder.js";
import { validateProductAvailability } from "../../services/order/validateProductAvailability.service.js";
import { inventoryChangeType } from "../../enums/inventoryChangeType.enum.js";
import { inventoryReferenceType } from "../../enums/inventoryReferenceType.enum.js";
import orderStatusHistory from "../../models/OrderStatusHistory.schema.js";

export const editOrderItem = async (req, res, next) => {
  const { orderId, itemId } = req.params;
  const { quantity } = req.body;
  const userCompanyId = req.user.company?._id || req.user.company;
  const userId = req.user._id;

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  if (!canEditOrder(order, userCompanyId)) {
    return next(new AppError("Order cannot be edited at this stage", 400));
  }

  const itemIndex = order.items.findIndex(
    (item) => item._id.toString() === itemId
  );
  if (itemIndex === -1) {
    return next(new AppError("Item not found in order", 404));
  }

  const item = order.items[itemIndex];

  // Only validate supplier inventory if order is SUBMITTED
  if (order.status === "Submitted") {
    await validateProductAvailability(item.sku, order.supplier, quantity);

    const supplierInventory = await Inventory.findOne({
      sku: item.sku,
      company: order.supplier,
      isActive: true,
    });

    if (supplierInventory) {
      // Calculate difference and update reserved quantity
      const quantityDifference = quantity - item.quantity;
      const beforeReserved = supplierInventory.reserved;
      const beforeOnHand = supplierInventory.onHand;

      supplierInventory.reserved += quantityDifference;
      await supplierInventory.save();

      // Log inventory history
      await InventoryHistory.create({
        inventory: supplierInventory._id,
        company: order.supplier,
        changeType:
          quantityDifference > 0
            ? inventoryChangeType.RESERVED
            : inventoryChangeType.UNRESERVED,
        quantityChange: {
          onHand: 0,
          reserved: quantityDifference,
        },
        before: {
          onHand: beforeOnHand,
          reserved: beforeReserved,
        },
        after: {
          onHand: supplierInventory.onHand,
          reserved: supplierInventory.reserved,
        },
        reason: `Order item ${item.sku} quantity changed from ${item.quantity} to ${quantity}`,
        referenceType: inventoryReferenceType.ORDER,
        referenceId: order._id,
        performedBy: userId,
      });
    }
  }

  // Update item and recalculate total
  const oldQuantity = item.quantity;
  order.items[itemIndex].quantity = quantity;
  order.items[itemIndex].subtotal = quantity * item.unitPrice;
  order.totalAmount = order.items.reduce((sum, item) => sum + item.subtotal, 0);

  // Add to history
  await orderStatusHistory.create({
    order: order._id,
    status: order.status,
    updatedBy: userId,
    notes: `Item ${item.sku} quantity changed from ${oldQuantity} to ${quantity}`,
  });

  await order.save();
  await order.populate([
    { path: "buyer", select: "companyName" },
    { path: "supplier", select: "companyName" },
  ]);

  return res.json({
    status: "success",
    message: "Item updated successfully",
    data: { order },
  });
};

// Remove item from order
export const removeOrderItem = async (req, res, next) => {
  const { orderId, itemId } = req.params;
  const userCompanyId = req.user.company?._id || req.user.company;
  const userId = req.user._id;

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  if (!canEditOrder(order, userCompanyId)) {
    return next(new AppError("Order cannot be edited at this stage", 400));
  }

  if (order.items.length === 1) {
    return next(new AppError("Cannot remove the last item from order", 400));
  }

  const itemIndex = order.items.findIndex(
    (item) => item._id.toString() === itemId
  );
  if (itemIndex === -1) {
    return next(new AppError("Item not found in order", 404));
  }

  const removedItem = order.items[itemIndex];

  // If order is SUBMITTED, release the reserved inventory
  if (order.status === "Submitted") {
    const supplierInventory = await Inventory.findOne({
      sku: removedItem.sku,
      company: order.supplier,
      isActive: true,
    });

    if (supplierInventory) {
      const beforeReserved = supplierInventory.reserved;
      const beforeOnHand = supplierInventory.onHand;

      supplierInventory.reserved -= removedItem.quantity;
      await supplierInventory.save();

      // Log inventory history
      await InventoryHistory.create({
        inventory: supplierInventory._id,
        company: order.supplier,
        changeType: inventoryChangeType.UNRESERVED,
        quantityChange: {
          onHand: 0,
          reserved: -removedItem.quantity,
        },
        before: {
          onHand: beforeOnHand,
          reserved: beforeReserved,
        },
        after: {
          onHand: supplierInventory.onHand,
          reserved: supplierInventory.reserved,
        },
        reason: `Order item ${removedItem.sku} removed from order`,
        referenceType: inventoryReferenceType.ORDER,
        referenceId: order._id,
        performedBy: userId,
      });
    }
  }

  order.items.splice(itemIndex, 1);

  // Recalculate total
  order.totalAmount = order.items.reduce((sum, item) => sum + item.subtotal, 0);

  // Add to history
  await orderStatusHistory.create({
    order: order._id,
    status: order.status,
    updatedBy: userId,
    notes: `Removed item ${removedItem.sku} (${removedItem.quantity} units)`,
  });

  await order.save();
  await order.populate([
    { path: "buyer", select: "companyName" },
    { path: "supplier", select: "companyName" },
  ]);

  return res.json({
    status: "success",
    message: "Item removed successfully",
    data: { order },
  });
};

// Add new item to order
export const addOrderItem = async (req, res, next) => {
  const { orderId } = req.params;
  const { sku, quantity } = req.body;
  const userCompanyId = req.user.company?._id || req.user.company;
  const userId = req.user._id;

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  if (!canEditOrder(order, userCompanyId)) {
    return next(new AppError("Order cannot be edited at this stage", 400));
  }

  // Check if item already exists
  if (order.items.some((item) => item.sku === sku)) {
    return next(new AppError("Item already exists in order", 400));
  }

  const buyerInventory = await Inventory.findOne({
    sku,
    company: userCompanyId,
    isActive: true,
  });
  if (!buyerInventory) {
    return next(new AppError(`Product ${sku} not found in your catalog`, 400));
  }

  const supplierInventory = await Inventory.findOne({
    sku,
    company: order.supplier,
    isActive: true,
  });
  if (!supplierInventory) {
    return next(new AppError(`Product ${sku} not found at supplier`, 400));
  }

  // Only validate and reserve inventory if order is SUBMITTED
  if (order.status === "Submitted") {
    await validateProductAvailability(sku, order.supplier, quantity);

    // Reserve inventory
    const beforeReserved = supplierInventory.reserved;
    const beforeOnHand = supplierInventory.onHand;

    supplierInventory.reserved += quantity;
    await supplierInventory.save();

    // Log inventory history
    await InventoryHistory.create({
      inventory: supplierInventory._id,
      company: order.supplier,
      changeType: inventoryChangeType.RESERVED,
      quantityChange: {
        onHand: 0,
        reserved: quantity,
      },
      before: {
        onHand: beforeOnHand,
        reserved: beforeReserved,
      },
      after: {
        onHand: supplierInventory.onHand,
        reserved: supplierInventory.reserved,
      },
      reason: `Order item ${sku} added to order`,
      referenceType: inventoryReferenceType.ORDER,
      referenceId: order._id,
      performedBy: userId,
    });
  }

  const newItem = {
    sku: supplierInventory.sku,
    productName: supplierInventory.productName,
    quantity,
    unitPrice: supplierInventory.unitPrice,
    subtotal: quantity * supplierInventory.unitPrice,
  };

  order.items.push(newItem);
  order.totalAmount = order.items.reduce((sum, item) => sum + item.subtotal, 0);

  // Add to history
  await orderStatusHistory.create({
    order: order._id,
    status: order.status,
    updatedBy: userId,
    notes: `Added item ${sku} (${quantity} units)`,
  });

  await order.save();
  await order.populate([
    { path: "buyer", select: "companyName" },
    { path: "supplier", select: "companyName" },
  ]);

  return res.json({
    status: "success",
    message: "Item added successfully",
    data: { order },
  });
};
