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

  // التحقق من صحة الانتقال
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

  // التحقق الخاص بحالة الموافقة
  if (newStatus === orderStatus.APPROVED && order.issues.length > 0) {
    throw new AppError(
      "Cannot approve order with unresolved issues. Please validate items first.",
      400
    );
  }

  // معالجة تأثير المخزون
  await handleInventoryImpact(order, currentStatus, newStatus, userId);

  // تحديث حالة الأوردر
  order.status = newStatus;

  if (confirmedDeliveryDate) {
    order.confirmedDeliveryDate = confirmedDeliveryDate;
  }

  // إضافة إلى التاريخ
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

// معالجة تأثير المخزون
const handleInventoryImpact = async (
  order,
  currentStatus,
  newStatus,
  userId
) => {
  const impact = INVENTORY_IMPACT[newStatus];
  if (!impact) return;

  for (const item of order.items) {
    // تأثير على مخزون المورد
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

    // تأثير على مخزون المشتري
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

// تحديث المخزون
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
    // إنشاء مخزون جديد إذا لم يكن موجوداً (للمشتري عند الاستلام)
    inventory = new Inventory({
      product: item.productId,
      company: impact.add ? order.buyer : order.supplier,
      location: order.deliveryLocation, // أو موقع افتراضي
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

  // تسجيل في تاريخ المخزون
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

// تحديد نوع التغيير
const getChangeType = (impact) => {
  if (impact.add) return inventoryChangeType.INCOMING;
  if (impact.deduct) return inventoryChangeType.OUTGOING;
  if (impact.reserve) return inventoryChangeType.RESERVED;
  if (impact.unreserve) return inventoryChangeType.UNRESERVED;
  return inventoryChangeType.ADJUSTMENT;
};
