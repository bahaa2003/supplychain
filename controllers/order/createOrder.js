import Order from "../../models/Order.js";
import { AppError } from "../../utils/AppError.js";
import createNotification from "../../utils/notification/createNotification.js";
import { notificationTemplates } from "../../utils/notificationTemplates/index.js";

export const createOrder = async (req, res) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const userId = req.user._id;
    const {
      supplier,
      items,
      totalAmount,
      currency,
      notes,
      requestedDeliveryDate,
      deliveryAddress,
      billingAddress,
      paymentTerms,
      tags,
    } = req.body;
    if (!supplier || !items || !Array.isArray(items) || items.length === 0) {
      throw new AppError("Supplier and items are required", 400);
    }
    // Generate unique order number (simple example)
    const orderNumber = `ORD-${Date.now()}`;
    const order = await Order.create({
      orderNumber,
      buyer: companyId,
      supplier,
      createdBy: userId,
      items,
      totalAmount,
      currency,
      notes,
      requestedDeliveryDate,
      deliveryAddress,
      billingAddress,
      paymentTerms,
      tags,
    });

    // Send notification to supplier (receiver)
    const { title, message, htmlMessage } = notificationTemplates.newOrder({
      orderNumber,
      customerName: req.user.name || "A company",
    });
    await createNotification({
      recipient: supplier, // assuming supplier is a userId or company admin userId
      type: "New Order",
      title,
      message,
      htmlMessage,
      related: "Order",
      relatedId: order._id,
    });

    res.status(201).json({ status: "success", data: order });
  } catch (err) {
    throw new AppError(err.message || "Failed to create order", 500);
  }
};
