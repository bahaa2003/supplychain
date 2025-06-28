import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import PartnerConnection from "../../models/PartnerConnection.js";
import { AppError } from "../../utils/AppError.js";
import { orderStatus } from "../../enums/orderStatus.enum.js";

export const createOrder = async (req, res) => {
  const {
    supplierId,
    items,
    deliveryLocationId,
    notes,
    requestedDeliveryDate,
  } = req.body;

  const buyerCompanyId = req.user.company;
  const userId = req.user._id;

  // check if there is an active connection between the companies
  const connection = await PartnerConnection.findOne({
    $or: [
      { requester: buyerCompanyId, recipient: supplierId },
      { requester: supplierId, recipient: buyerCompanyId },
    ],
    status: "Active",
  });

  if (!connection) {
    throw new AppError("No active partnership exists with this supplier", 400);
  }

  // check if the products are valid and calculate the total amount
  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findOne({
      _id: item.productId,
      company: supplierId,
      isActive: true,
    });

    if (!product) {
      throw new AppError(
        `Product ${item.productId} not found or inactive`,
        400
      );
    }

    const subtotal = item.quantity * product.price;
    totalAmount += subtotal;

    orderItems.push({
      productId: product._id,
      sku: product.sku,
      name: product.name,
      quantity: item.quantity,
      unitPrice: product.price,
      subtotal,
    });
  }

  // create the order number
  const orderCount = await Order.countDocuments();
  const orderNumber = `ORD-${Date.now()}-${orderCount + 1}`;

  const order = await Order.create({
    orderNumber,
    buyer: buyerCompanyId,
    supplier: supplierId,
    createdBy: userId,
    status: orderStatus.CREATED,
    items: orderItems,
    totalAmount,
    deliveryLocation: deliveryLocationId,
    notes,
    requestedDeliveryDate,
    issues: [], // will be filled when the validation is done
  });

  await order.populate([
    { path: "buyer", select: "name" },
    { path: "supplier", select: "name" },
    { path: "createdBy", select: "name email" },
    { path: "deliveryLocation", select: "name address" },
  ]);

  res.status(201).json({
    status: "success",
    message: "Order created successfully",
    data: { order },
  });
};
