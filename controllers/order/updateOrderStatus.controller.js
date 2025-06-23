import Order from "../../models/Order.js";
import { AppError } from "../../utils/AppError.js";
import createNotification from "../../services/notification.service.js";
import Inventory from "../../models/Inventory.js";
import InventoryHistory from "../../models/InventoryHistory.js";
import User from "../../models/User.js";
import Product from "../../models/Product.js";
import { createProductFromSourceService } from "../../services/product/createProductFromSource.service.js";

export const updateOrderStatus = async (req, res) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const { status } = req.body;

    // Find and validate order
    const order = await Order.findById(req.params.id);
    if (!order) throw new AppError("Order not found", 404);

    if (order.supplier.toString() !== companyId.toString()) {
      throw new AppError("Not authorized to update this order", 403);
    }

    // Handle order confirmation - deduct supplier inventory
    if (status === "Confirmed") {
      await handleOrderConfirmation(order, req.user._id);
    }

    // Handle order completion - add inventory to buyer
    if (status === "Completed") {
      await handleOrderCompletion(order, req.user._id);
    }

    // Update order status
    order.status = status;
    await order.save();

    // Send notification to buyer
    await sendOrderStatusNotification(order, status);

    return res.status(200).json({ status: "success", data: order });
  } catch (err) {
    throw new AppError(err.message || "Failed to update order status", 500);
  }
};

// Helper function to handle order confirmation
async function handleOrderConfirmation(order, userId) {
  // Check inventory availability for all items first
  for (const item of order.items) {
    const inventory = await findInventoryByProduct(
      item.product,
      order.supplier
    );
    if (!inventory || inventory.currentQuantity < item.quantity) {
      throw new AppError(
        `Insufficient inventory for product ${item.product}`,
        400
      );
    }
  }

  // Deduct inventory and create history records
  for (const item of order.items) {
    const inventory = await findInventoryByProduct(
      item.product,
      order.supplier
    );
    const previousQuantity = inventory.currentQuantity;

    inventory.currentQuantity -= item.quantity;
    await inventory.save();

    await createInventoryHistoryRecord({
      inventoryId: inventory._id,
      changeType: "Order Deduction",
      quantityChange: -item.quantity,
      previousQuantity,
      newQuantity: inventory.currentQuantity,
      reason: "Order fulfillment",
      orderId: order._id,
      userId,
    });
  }
}

// Helper function to handle order completion
async function handleOrderCompletion(order, userId) {
  for (const item of order.items) {
    const buyerProduct = await getOrCreateBuyerProduct(
      item.product,
      order.buyer
    );
    const buyerInventory = await updateBuyerInventory(
      buyerProduct._id,
      order.buyer,
      item.quantity
    );

    await createInventoryHistoryRecord({
      inventoryId: buyerInventory._id,
      changeType: "Order Receive",
      quantityChange: item.quantity,
      previousQuantity: buyerInventory.currentQuantity - item.quantity,
      newQuantity: buyerInventory.currentQuantity,
      reason: "Order received",
      orderId: order._id,
      userId,
    });
  }
}

// Helper function to find or create buyer product
async function getOrCreateBuyerProduct(supplierProductId, buyerCompanyId) {
  // Try to find existing product linked to supplier product
  let buyerProduct = await Product.findOne({
    company: buyerCompanyId,
    relatedProducts: supplierProductId,
  });

  if (buyerProduct) {
    return buyerProduct;
  }

  const supplierProduct = await Product.findById(supplierProductId);

  // Try to find product by name
  buyerProduct = await Product.findOne({
    company: buyerCompanyId,
    name: supplierProduct.name,
  });

  if (buyerProduct) {
    // Link the products if they exist but aren't linked
    await linkProducts(buyerProduct, supplierProduct);
    return buyerProduct;
  }

  // Create new product from source
  return await createProductFromSourceService({
    sourceProductId: supplierProductId,
    companyId: buyerCompanyId,
  });
}

// Helper function to link related products
async function linkProducts(buyerProduct, supplierProduct) {
  let buyerUpdated = false;
  let supplierUpdated = false;

  if (!buyerProduct.relatedProducts.includes(supplierProduct._id)) {
    buyerProduct.relatedProducts.push(supplierProduct._id);
    buyerUpdated = true;
  }

  if (!supplierProduct.relatedProducts.includes(buyerProduct._id)) {
    supplierProduct.relatedProducts.push(buyerProduct._id);
    supplierUpdated = true;
  }

  if (buyerUpdated) await buyerProduct.save();
  if (supplierUpdated) await supplierProduct.save();
}

// Helper function to find inventory by product and company
async function findInventoryByProduct(productId, companyId) {
  return await Inventory.findOne({
    product: productId,
    company: companyId,
  });
}

// Helper function to update buyer inventory
async function updateBuyerInventory(productId, companyId, quantity) {
  let inventory = await findInventoryByProduct(productId, companyId);

  if (!inventory) {
    inventory = await Inventory.create({
      product: productId,
      company: companyId,
      currentQuantity: quantity,
    });
  } else {
    inventory.currentQuantity += quantity;
    await inventory.save();
  }

  return inventory;
}

// Helper function to create inventory history record
async function createInventoryHistoryRecord({
  inventoryId,
  changeType,
  quantityChange,
  previousQuantity,
  newQuantity,
  reason,
  orderId,
  userId,
}) {
  await InventoryHistory.create({
    inventory: inventoryId,
    changeType,
    quantityChange,
    previousQuantity,
    newQuantity,
    reason,
    referenceType: "Order",
    referenceId: orderId,
    performedBy: userId,
  });
}

// Helper function to send order status notification
async function sendOrderStatusNotification(order, status) {
  const recipients = await User.find({
    company: order.buyer,
    role: { $in: ["admin", "manager"] },
  });

  await createNotification(
    "orderStatusChange",
    {
      orderNumber: order.orderNumber,
      newStatus: status,
    },
    recipients
  );
}
