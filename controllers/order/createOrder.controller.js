import Order from "../../models/Order.js";
import Product from "../../models/Product.js";
import PartnerConnection from "../../models/PartnerConnection.js";
import { AppError } from "../../utils/AppError.js";
import { orderStatus } from "../../enums/orderStatus.enum.js";

export const createOrder = async (req, res, next) => {
  const { supplierId } = req.params;
  const { items, deliveryLocation, notes, requestedDeliveryDate } = req.body;

  const buyerCompanyId = req.user.company?._id || req.user.company;
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
    return next(
      new AppError("No active partnership exists with this supplier", 400)
    );
  }
  if (buyerCompanyId === supplierId) {
    return next(new AppError("You cannot create an order for yourself", 400));
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
      return next(
        new AppError(`Product ${item.productId} not found or inactive`, 400)
      );
    }

    const subtotal = item.quantity * product.unitPrice;
    totalAmount += subtotal;

    orderItems.push({
      productId: product._id,
      sku: product.sku,
      productName: product.productName,
      quantity: item.quantity,
      unitPrice: product.unitPrice,
      subtotal,
    });
  }

  // create the order number
  const orderCount = await Order.countDocuments();
  const orderNumber = `ORD-${Date.now()}-${orderCount + 1}`;
  // split may be / or - or , or . \ or space
  const [day, month, year] = requestedDeliveryDate.split(/[\/\\\-\,\.]/);
  const parsedDate = new Date(+year, +month - 1, +day);
  if (isNaN(parsedDate.getTime())) {
    return next(new AppError("Invalid date format", 400));
  }
  const order = await Order.create({
    orderNumber,
    buyer: buyerCompanyId,
    supplier: supplierId,
    createdBy: userId,
    status: orderStatus.CREATED,
    items: orderItems,
    totalAmount,
    deliveryLocation,
    notes,
    requestedDeliveryDate: parsedDate,
    issues: [], // will be filled when the validation is done
  });

  await order.populate([
    { path: "buyer", select: "companyName" },
    { path: "supplier", select: "companyName" },
    { path: "createdBy", select: "name email" },
    { path: "deliveryLocation", select: "locationName city state country" },
  ]);

  res.status(201).json({
    status: "success",
    message: "Order created successfully",
    data: { order },
  });
};
