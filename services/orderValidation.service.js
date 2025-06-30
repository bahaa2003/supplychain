import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Inventory from "../models/Inventory.js";
import { AppError } from "../utils/AppError.js";
import { orderStatus } from "../enums/orderStatus.enum.js";

/**
 * Validate order items against current product and inventory data
 */
export const validateOrderItemsService = async (orderId, userCompanyId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Check if user is the buyer
  if (order.buyer.toString() !== userCompanyId.toString()) {
    throw new AppError("You can only validate your own orders", 403);
  }

  // Check if order can be validated
  if (![orderStatus.CREATED, orderStatus.APPROVED].includes(order.status)) {
    throw new AppError("Order cannot be validated in current status", 400);
  }

  const issues = [];

  for (const item of order.items) {
    const product = await Product.findOne({
      sku: item.sku,
      company: order.supplier,
      isActive: true,
    });

    if (!product) {
      issues.push({
        sku: item.sku,
        problem: "product_inactive",
      });
      continue;
    }

    const inventory = await Inventory.findOne({
      product: product._id,
      company: order.supplier,
    });

    const issue = { sku: item.sku };
    let hasIssue = false;

    // Check price changes
    if (product.unitPrice !== item.unitPrice) {
      issue.problem = "price_changed";
      issue.current_price = product.unitPrice;
      hasIssue = true;
    }

    // Check inventory availability
    if (!inventory) {
      issue.problem = issue.problem
        ? `${issue.problem}, no_inventory`
        : "no_inventory";
      issue.available_quantity = 0;
      hasIssue = true;
    } else {
      const availableQuantity = inventory.onHand - inventory.reserved;
      if (availableQuantity < item.quantity) {
        issue.problem = issue.problem
          ? `${issue.problem}, insufficient_quantity`
          : "insufficient_quantity";
        issue.available_quantity = Math.max(0, availableQuantity);
        hasIssue = true;
      }
    }

    if (hasIssue) {
      issues.push(issue);
    }
  }

  // Update order with issues
  order.issues = issues;
  await order.save();

  return {
    hasIssues: issues.length > 0,
    issues,
    canProceed: issues.length === 0,
  };
};

/**
 * Auto-fix order issues by adjusting prices and quantities
 */
export const fixOrderIssuesService = async (orderId, userCompanyId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // Check permissions and status
  if (order.buyer.toString() !== userCompanyId.toString()) {
    throw new AppError("You can only modify your own orders", 403);
  }

  if (order.status !== orderStatus.CREATED) {
    throw new AppError("Order can only be fixed in CREATED status", 400);
  }

  const fixedItems = [];
  const removedItems = [];
  const mergedItems = new Map();

  for (const item of order.items) {
    // Check if buyer has this product
    const buyerProduct = await Product.findOne({
      sku: item.sku,
      company: order.buyer,
      isActive: true,
    });

    if (!buyerProduct) {
      removedItems.push({
        sku: item.sku,
        reason: "Product not found in buyer catalog",
      });
      continue;
    }

    // Check buyer inventory
    const buyerInventory = await Inventory.findOne({
      product: buyerProduct._id,
      company: order.buyer,
    });

    if (!buyerInventory) {
      removedItems.push({
        sku: item.sku,
        reason: "No inventory record for buyer",
      });
      continue;
    }

    // Check supplier product and inventory
    const supplierProduct = await Product.findOne({
      sku: item.sku,
      company: order.supplier,
      isActive: true,
    });

    if (!supplierProduct) {
      removedItems.push({
        sku: item.sku,
        reason: "Product inactive at supplier",
      });
      continue;
    }

    const supplierInventory = await Inventory.findOne({
      product: supplierProduct._id,
      company: order.supplier,
    });

    const availableQuantity = supplierInventory
      ? Math.max(0, supplierInventory.onHand - supplierInventory.reserved)
      : 0;

    if (availableQuantity === 0) {
      removedItems.push({
        sku: item.sku,
        reason: "No inventory available at supplier",
      });
      continue;
    }

    // Merge duplicate SKUs
    if (mergedItems.has(item.sku)) {
      const existing = mergedItems.get(item.sku);
      existing.quantity += item.quantity;
    } else {
      mergedItems.set(item.sku, {
        sku: item.sku,
        productName: supplierProduct.productName,
        quantity: item.quantity,
        unitPrice: supplierProduct.price, // Use current price
        subtotal: 0, // Will be calculated
      });
    }
  }

  // Adjust quantities and calculate subtotals
  for (const [sku, item] of mergedItems) {
    const supplierProduct = await Product.findOne({
      sku,
      company: order.supplier,
    });
    const supplierInventory = await Inventory.findOne({
      product: supplierProduct._id,
      company: order.supplier,
    });

    const availableQuantity = supplierInventory
      ? Math.max(0, supplierInventory.onHand - supplierInventory.reserved)
      : 0;

    // Adjust quantity if needed
    if (item.quantity > availableQuantity) {
      item.quantity = availableQuantity;
    }

    item.subtotal = item.quantity * item.unitPrice;
    fixedItems.push(item);
  }

  // Update order
  order.items = fixedItems;
  order.issues = []; // Clear issues after fixing
  await order.save();

  return {
    fixedItems: fixedItems.length,
    removedItems,
    totalAmount: order.totalAmount,
  };
};
