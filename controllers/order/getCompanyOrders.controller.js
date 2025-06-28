import Order from "../../models/Order.js";
import { AppError } from "../../utils/AppError.js";
import { orderStatus } from "../../enums/orderStatus.enum.js";

export const getCompanyOrders = async (req, res) => {
  const userCompanyId = req.user.company?._id || req.user.company;
  const {
    page = 1,
    limit = 10,
    status,
    role, // 'buyer' or 'supplier'
    startDate,
    endDate,
    search,
  } = req.query;

  // build the filter
  let filter = {
    $or: [
      {
        buyer: userCompanyId,
        status: { $in: [orderStatus.CANCELLED, orderStatus.CREATED] },
      },
      {
        $and: [
          {
            $or: [{ buyer: userCompanyId }, { supplier: userCompanyId }],
            status: { $nin: [orderStatus.CANCELLED, orderStatus.CREATED] },
          },
        ],
      },
    ],
  };

  // filter by role
  if (role) {
    if (role === "buyer") {
      filter = { buyer: userCompanyId };
    } else if (role === "supplier") {
      filter = { supplier: userCompanyId };
    }
  }
  // filter by status
  if (status) {
    filter.status = status;
  }

  // filter by date
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // search
  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: "i" } },
      { "items.name": { $regex: search, $options: "i" } },
      { "items.sku": { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .select({
        __v: false,
        items: false,
        createdBy: false,
        confirmedDeliveryDate: false,
        requestedDeliveryDate: false,
        notes: false,
        totalAmount: false,
        orderNumber: false,
        history: false,
        issues: false,
        invoice: false,
        shipments: false,
        returnInfo: false,
        returnProcessing: false,
      })
      .populate([
        { path: "buyer", select: "companyName" },
        { path: "supplier", select: "companyName" },
        { path: "deliveryLocation", select: "locationName city state country" },
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Order.countDocuments(filter),
  ]);

  // add the role to the current user
  const ordersWithRole = orders.map((order) => {
    const orderObj = order.toObject();
    orderObj.userRole =
      order.buyer.toString() === userCompanyId.toString()
        ? "buyer"
        : "supplier";
    return orderObj;
  });

  return res.status(200).json({
    status: "success",
    results: ordersWithRole.length,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    data: ordersWithRole,
  });
};
