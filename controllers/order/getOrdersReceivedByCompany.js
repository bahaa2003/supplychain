import Order from "../../models/Order.js";
import { AppError } from "../../utils/AppError.js";
import createNotification from "../../services/notification.service.js";
import User from "../../models/User.js";

export const getOrdersReceivedByCompany = async (req, res) => {
  try {
    const companyId = req.user.company?._id || req.user.company;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find({ supplier: companyId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Order.countDocuments({ supplier: companyId }),
    ]);

    // Get company users with admin or manager role
    const recipients = await User.find({
      company: companyId,
      role: { $in: ["admin", "manager"] },
    });

    // Send notification (optional, for auditing)
    await createNotification(
      "systemAlert",
      {
        message: "Viewed received orders list",
      },
      recipients
    );

    res.status(200).json({
      status: "success",
      results: orders.length,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: orders,
    });
  } catch (err) {
    throw new AppError(err.message || "Failed to get received orders", 500);
  }
};
