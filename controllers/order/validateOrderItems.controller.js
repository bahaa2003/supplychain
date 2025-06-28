import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import Inventory from "../../models/Inventory.js";
import { AppError } from "../../utils/AppError.js";
import { orderStatus } from "../../enums/orderStatus.enum.js";

export const validateOrderItems = async (req, res) => {
  const { orderId } = req.params;
  const userCompanyId = req.user.company;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // التحقق من أن المستخدم ينتمي للشركة المشترية
  if (order.buyer.toString() !== userCompanyId.toString()) {
    throw new AppError("You can only validate your own orders", 403);
  }

  // التحقق من أن الأوردر في حالة تسمح بالتحقق
  if (![orderStatus.CREATED, orderStatus.APPROVED].includes(order.status)) {
    throw new AppError("Order cannot be validated in current status", 400);
  }

  const issues = [];
  let hasIssues = false;

  // التحقق من كل منتج
  for (const item of order.items) {
    const product = await Product.findById(item.productId);
    const inventory = await Inventory.findOne({
      product: item.productId,
      company: order.supplier,
    });

    const issue = { sku: item.sku };
    let itemHasIssue = false;

    // التحقق من تغيير السعر
    if (product && product.price !== item.unitPrice) {
      issue.problem = "price_changed";
      issue.current_price = product.price;
      itemHasIssue = true;
    }

    // التحقق من توفر الكمية
    if (inventory) {
      const availableQuantity = inventory.onHand - inventory.reserved;
      if (availableQuantity < item.quantity) {
        issue.problem = issue.problem
          ? `${issue.problem}, insufficient_quantity`
          : "insufficient_quantity";
        issue.available_quantity = availableQuantity;
        itemHasIssue = true;
      }
    } else {
      issue.problem = issue.problem
        ? `${issue.problem}, no_inventory`
        : "no_inventory";
      issue.available_quantity = 0;
      itemHasIssue = true;
    }

    // التحقق من أن المنتج ما زال نشطًا
    if (!product || !product.isActive) {
      issue.problem = issue.problem
        ? `${issue.problem}, product_inactive`
        : "product_inactive";
      itemHasIssue = true;
    }

    if (itemHasIssue) {
      issues.push(issue);
      hasIssues = true;
    }
  }

  // تحديث الأوردر بالمشاكل المكتشفة
  order.issues = issues;
  await order.save();

  res.json({
    status: "success",
    message: hasIssues
      ? "Issues found in order items"
      : "All items validated successfully",
    data: {
      hasIssues,
      issues,
      canProceed: !hasIssues,
    },
  });
};
