import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import { AppError } from "../../utils/AppError.js";
import { canEditOrder } from "../../utils/order/canEditOrder.js";
import { validateProductAvailability } from "../../services/order/validateProductAvailability.service.js";

// Edit item quantity
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

  // Validate supplier inventory
  await validateProductAvailability(item.sku, order.supplier, quantity);

  // Update item and recalculate total
  const oldQuantity = item.quantity;
  order.items[itemIndex].quantity = quantity;
  order.items[itemIndex].subtotal = quantity * item.unitPrice;

  order.totalAmount = order.items.reduce((sum, item) => sum + item.subtotal, 0);

  // Add to history
  order.history.push({
    status: order.status,
    updatedBy: userId,
    notes: `Item ${item.sku} quantity changed from ${oldQuantity} to ${quantity}`,
  });

  await order.save();
  await order.populate([
    { path: "buyer", select: "name" },
    { path: "supplier", select: "name" },
  ]);

  res.json({
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
  order.items.splice(itemIndex, 1);

  // Recalculate total
  order.totalAmount = order.items.reduce((sum, item) => sum + item.subtotal, 0);

  // Add to history
  order.history.push({
    status: order.status,
    updatedBy: userId,
    notes: `Removed item ${removedItem.sku} (${removedItem.quantity} units)`,
  });

  await order.save();
  await order.populate([
    { path: "buyer", select: "name" },
    { path: "supplier", select: "name" },
  ]);

  res.json({
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

  // Validate buyer has this product
  const buyerProduct = await Product.findOne({
    sku,
    company: userCompanyId,
    isActive: true,
  });

  if (!buyerProduct) {
    return next(new AppError(`Product ${sku} not found in your catalog`, 400));
  }

  // Validate supplier product and inventory
  const supplierProduct = await validateProductAvailability(
    sku,
    order.supplier,
    quantity
  );

  // Add new item
  const newItem = {
    sku: supplierProduct.sku,
    productName: supplierProduct.productName,
    quantity,
    unitPrice: supplierProduct.unitPrice,
    subtotal: quantity * supplierProduct.unitPrice,
  };

  order.items.push(newItem);
  order.totalAmount = order.items.reduce((sum, item) => sum + item.subtotal, 0);

  // Add to history
  order.history.push({
    status: order.status,
    updatedBy: userId,
    notes: `Added item ${sku} (${quantity} units)`,
  });

  await order.save();
  await order.populate([
    { path: "buyer", select: "name" },
    { path: "supplier", select: "name" },
  ]);

  res.json({
    status: "success",
    message: "Item added successfully",
    data: { order },
  });
};
