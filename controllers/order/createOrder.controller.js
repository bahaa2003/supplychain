import User from "../../models/User.js";
import Company from "../../models/Company.js";
import Order from "../../models/Order.js";
import createNotification from "../../services/notification.service.js";
import Product from "../../models/Product.js";
import PartnerConnection from "../../models/PartnerConnection.js";
import { AppError } from "../../utils/AppError.js";
import { orderStatus } from "../../enums/orderStatus.enum.js";
import Inventory from "../../models/Inventory.js";
import { notificationType } from "../../enums/notificationType.enum.js";

export const createOrder = async (req, res, next) => {
  const { supplierId } = req.params;
  const { items, deliveryLocation, notes, requestedDeliveryDate } = req.body;

  const buyerCompanyId = req.user.company?._id || req.user.company;
  const userId = req.user._id;

  const supplierCompany = await Company.findById(supplierId);
  console.log("supplierCompany", supplierCompany);

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

  // check if there are duplicated sku return error
  const allSku = items.map((item) => item.sku);
  const uniqueSku = new Set(allSku);
  if (allSku.length !== uniqueSku.size) {
    return next(new AppError("Duplicate items found in order", 400));
  }

  for (const item of items) {
    const { quantity } = item;
    // Check if buyer has this product
    const buyerProduct = await Product.findOne({
      sku: item.sku,
      company: buyerCompanyId,
      isActive: true,
    });

    if (!buyerProduct) {
      return next(
        new AppError(`Product ${item.sku} not found in your catalog`, 400)
      );
    }

    // Check buyer inventory
    const buyerInventory = await Inventory.findOne({
      product: buyerProduct._id,
      company: buyerCompanyId,
    });

    if (!buyerInventory) {
      return next(
        new AppError(`No inventory record found for product ${item.sku}`, 400)
      );
    }

    // Check supplier product
    const supplierProduct = await Product.findOne({
      sku: item.sku,
      company: supplierId,
      isActive: true,
    });

    if (!supplierProduct) {
      return next(
        new AppError(
          `Product ${item.sku} not found or inactive at supplier`,
          400
        )
      );
    }
    const supplerInventory = await Inventory.findOne({
      product: supplierProduct._id,
      company: supplierId,
    });

    const unitPrice = supplierProduct.unitPrice;

    const subtotal = quantity * unitPrice;
    totalAmount += subtotal;

    orderItems.push({
      sku: supplierProduct.sku,
      productName: supplierProduct.productName,
      quantity,
      unitPrice,
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
    history: [
      {
        status: orderStatus.CREATED,
        updatedBy: userId,
        notes: notes || `created order with ${orderItems.length} items`,
      },
    ],
    issues: [], // will be filled when the validation is done
  });

  await order.populate([
    { path: "buyer", select: "companyName" },
    { path: "supplier", select: "companyName" },
    { path: "createdBy", select: "name email" },
    { path: "deliveryLocation", select: "locationName city state country" },
  ]);
  const adminOfBuyerCompanyId = await User.findOne({
    role: "admin",
    company: buyerCompanyId,
  }).select("_id");
  // create a notification for the admin compant
  await createNotification(
    notificationType.CREATED_ORDER,
    {
      companyName: supplierCompany.companyName,
      totalAmount,
    },
    adminOfBuyerCompanyId
  );

  return res.status(201).json({
    status: "success",
    message: "Order created successfully",
    data: { order },
  });
};
