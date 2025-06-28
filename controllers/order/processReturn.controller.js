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
    acceptedItems, // المنتجات المقبولة للإرجاع
    rejectedItems, // المنتجات المرفوضة
    processingNotes,
  } = req.body;
  const userId = req.user._id;
  const userCompanyId = req.user.company;

  const order = await Order.findById(orderId);
  if (!order) {
    throw new AppError("Order not found", 404);
  }

  // التحقق من أن المستخدم ينتمي للشركة المورِّدة
  if (order.supplier.toString() !== userCompanyId.toString()) {
    throw new AppError("You can only process returns for your own orders", 403);
  }

  // التحقق من حالة الأوردر
  if (order.status !== orderStatus.RETURNED) {
    throw new AppError("Order is not in returned status", 400);
  }

  // معالجة المنتجات المقبولة - إضافة لمخزون المورد
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

      // تسجيل في تاريخ المخزون
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

  // تحديث معلومات معالجة الإرجاع
  order.returnProcessing = {
    acceptedItems,
    rejectedItems,
    processingNotes,
    processedBy: userId,
    processedAt: new Date(),
  };

  // تحديث حالة الأوردر
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
