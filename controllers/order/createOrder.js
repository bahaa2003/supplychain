import Order from "../../models/Order.js";
import { AppError } from "../../utils/AppError.js";
import createNotification from "../../services/notification.service.js";
import Product from "../../models/Product.js";
import { userRoleEnum } from "../../enums/role.enum.js";

export const createOrder = async (req, res) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const userId = req.user._id;
    const {
      supplier,
      items,
      currency,
      notes,
      requestedDeliveryDate,
      deliveryAddress,
      billingAddress,
      paymentTerms,
      tags,
    } = req.body;
    const selectedItems = await Product.find({
      _id: { $in: items },
    });
    const amount = selectedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
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
    const recipient = await User.findBy({
      company: supplier,
      role: { $in: ["admin", "manager"] },
    });
    // Send notification to supplier using the notification service
    await createNotification(
      "newOrder",
      {
        orderNumber,
        amount,
      },
      recipient
    );

    res.status(201).json({ status: "success", data: order });
  } catch (err) {
    throw new AppError(err.message || "Failed to create order", 500);
  }
};
