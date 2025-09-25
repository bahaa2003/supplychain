import Order from "../../models/Order.schema.js";
import Inventory from "../../models/Inventory.schema.js";
import InventoryHistory from "../../models/InventoryHistory.schema.js";
import Product from "../../models/Product.schema.js";
import { AppError } from "../../utils/AppError.js";
import { INVENTORY_IMPACT, orderStatus } from "../../enums/orderStatus.enum.js";
import { notificationType } from "../../enums/notificationType.enum.js";
import createNotification from "../../services/notification.service.js";
import { checkOrderStatusTransition } from "../../utils/order/checkOrderStatusTransition.js";
import { inventoryChangeType } from "../../enums/inventoryChangeType.enum.js";
import { inventoryReferenceType } from "../../enums/inventoryReferenceType.enum.js";
import User from "../../models/User.schema.js";
import { roles } from "../../enums/role.enum.js";
import orderStatusHistory from "../../models/OrderStatusHistory.schema.js";

export const updateOrderStatus = async (req, res, next) => {
  const { orderId } = req.params;
  const { status: newStatus, notes, confirmedDeliveryDate } = req.body;
  const userId = req.user._id;
  const userCompanyId = req.user.company?._id || req.user.company;

  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError("Order not found", 404));
  }

  const currentStatus = order.status;

  // Check if transition is valid
  if (
    !checkOrderStatusTransition(currentStatus, newStatus, userCompanyId, order)
  ) {
    return next(
      new AppError(
        `Invalid status transition from ${currentStatus} to ${newStatus} for ${
          order.buyer.toString() === userCompanyId.toString()
            ? "buyer"
            : "supplier"
        }`,
        400
      )
    );
  }
  // Process inventory impact
  await handleInventoryImpact(order, currentStatus, newStatus, userId);

  // Update order
  order.status = newStatus;
  if (confirmedDeliveryDate) {
    order.confirmedDeliveryDate = confirmedDeliveryDate;
  }

  // Add to history
  await orderStatusHistory.create({
    order: order._id,
    status: newStatus,
    updatedBy: userId,
    notes: notes || `Status changed from ${currentStatus} to ${newStatus}`,
  });

  await order.save();

  await order.populate([
    { path: "buyer", select: "companyName" },
    { path: "supplier", select: "companyName" },
  ]);

  if (newStatus === orderStatus.SUBMITTED) {
    const recieveNotification = await User.find({
      company: order.supplier,
      role: { $in: [roles.ADMIN, roles.MANAGER] },
    }).select("_id");
    await createNotification(
      notificationType.NEW_ORDER,
      { orderNumber: order.orderNumber, totalAmount: order.totalAmount },
      recieveNotification
    );
  } else if (
    [orderStatus.RECEIVED, orderStatus.CANCELLED].includes(newStatus)
  ) {
    const recieveNotification = await User.find({
      company: order.supplier,
      role: { $in: [roles.ADMIN, roles.MANAGER] },
    }).select("_id");
    await createNotification(
      notificationType.ORDER_STATUS_CHANGE,
      { orderNumber: order.orderNumber, status: newStatus },
      recieveNotification
    );
  } else if (
    [
      orderStatus.ACCEPTED,
      orderStatus.REJECTED,
      orderStatus.PREPARING,
      orderStatus.READY_TO_SHIP,
      orderStatus.SHIPPED,
      orderStatus.DELIVERED,
    ].includes(newStatus)
  ) {
    const recieveNotification = await User.find({
      company: order.buyer,
      role: { $in: [roles.ADMIN, roles.MANAGER] },
    }).select("_id");
    console.log("recieveNotification Id:", recieveNotification);
    await createNotification(
      notificationType.ORDER_STATUS_CHANGE,
      { orderNumber: order.orderNumber, status: newStatus },
      recieveNotification
    );
  }
  const history = orderStatusHistory.find({ order: order._id });
  return res.json({
    status: "success",
    message: "Order updated successfully",
    data: { ...order, history },
  });
};

/*******************************************************************************
 *******************************************************************************
 *******************************************************************************
 */

// Helper functions
const handleInventoryImpact = async (
  order,
  currentStatus,
  newStatus,
  userId
) => {
  const impact = INVENTORY_IMPACT[newStatus];
  if (!impact) return;

  for (const item of order.items) {
    // Supplier inventory impact
    if (impact.supplier) {
      const supplierProduct = await Product.findOne({
        sku: item.sku,
        company: order.supplier,
      });

      if (supplierProduct) {
        const supplierInventory = await Inventory.findOne({
          product: supplierProduct._id, // Fixed: use product ID instead of SKU
          company: order.supplier,
        });

        if (supplierInventory) {
          await updateInventory(
            supplierInventory,
            item,
            impact.supplier,
            userId,
            order,
            `Order ${newStatus.toLowerCase()}`
          );
        }
      }
    }

    // Buyer inventory impact
    if (impact.buyer) {
      const buyerProduct = await Product.findOne({
        sku: item.sku,
        company: order.buyer,
      });

      if (!buyerProduct) {
        throw new AppError(
          `Product ${item.sku} not found in buyer catalog`,
          404
        );
      }

      const buyerInventory = await Inventory.findOne({
        product: buyerProduct._id,
        company: order.buyer,
      });

      if (!buyerInventory) {
        throw new AppError(
          `No inventory record found for product ${item.sku} in buyer company`,
          404
        );
      }

      await updateInventory(
        buyerInventory,
        item,
        impact.buyer,
        userId,
        order,
        `Order ${newStatus.toLowerCase()}`
      );
    }
  }
};

const updateInventory = async (
  inventory,
  item,
  impact,
  userId,
  order,
  reason
) => {
  if (!inventory) {
    throw new AppError(`Inventory not found for SKU ${item.sku}`, 404);
  }

  const product = await Product.findById(inventory.product);
  if (!product) {
    throw new AppError(`Product not found for SKU ${item.sku}`, 404);
  }

  const before = {
    onHand: inventory.onHand,
    reserved: inventory.reserved,
  };

  const quantityChange = { onHand: 0, reserved: 0 };

  // Apply inventory changes
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

  // Log inventory history
  await InventoryHistory.create({
    inventory: inventory._id,
    company: inventory.company,
    product: product._id,
    changeType: getChangeType(impact),
    quantityChange,
    before,
    after,
    reason,
    referenceType: inventoryReferenceType.ORDER,
    referenceId: order._id,
    performedBy: userId,
  });
};

const getChangeType = (impact) => {
  if (impact.add) return inventoryChangeType.INCOMING;
  if (impact.deduct) return inventoryChangeType.OUTGOING;
  if (impact.reserve) return inventoryChangeType.RESERVED;
  if (impact.unreserve) return inventoryChangeType.UNRESERVED;
  return inventoryChangeType.ADJUSTMENT;
};
