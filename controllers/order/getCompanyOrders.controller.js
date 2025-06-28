import Order from "../../models/Order.js";
import { AppError } from "../../utils/AppError.js";

export const getCompanyOrders = async (req, res) => {
  const userCompanyId = req.user.company;
  const {
    page = 1,
    limit = 10,
    status,
    role, // 'buyer' or 'supplier'
    startDate,
    endDate,
    search,
  } = req.query;

  // بناء الفلتر
  let filter = {
    $or: [{ buyer: userCompanyId }, { supplier: userCompanyId }],
  };

  // فلتر حسب الدور
  if (role === "buyer") {
    filter = { buyer: userCompanyId };
  } else if (role === "supplier") {
    filter = { supplier: userCompanyId };
  }

  // فلتر حسب الحالة
  if (status) {
    filter.status = status;
  }

  // فلتر حسب التاريخ
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  // البحث
  if (search) {
    filter.$or = [
      { orderNumber: { $regex: search, $options: "i" } },
      { "items.name": { $regex: search, $options: "i" } },
      { "items.sku": { $regex: search, $options: "i" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [orders, totalCount] = await Promise.all([
    Order.find(filter)
      .populate([
        { path: "buyer", select: "name" },
        { path: "supplier", select: "name" },
        { path: "createdBy", select: "name email" },
        { path: "deliveryLocation", select: "name address" },
      ])
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Order.countDocuments(filter),
  ]);

  // إضافة معلومة الدور للمستخدم الحالي
  const ordersWithRole = orders.map((order) => {
    const orderObj = order.toObject();
    orderObj.userRole =
      order.buyer.toString() === userCompanyId.toString()
        ? "buyer"
        : "supplier";
    return orderObj;
  });

  res.json({
    status: "success",
    data: {
      orders: ordersWithRole,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: skip + orders.length < totalCount,
        hasPrev: page > 1,
      },
    },
  });
};
