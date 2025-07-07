import User from "../../models/User.schema.js";
import { AppError } from "../../utils/AppError.js";

export const getAllEmployee = async (req, res, next) => {
  try {
    const { user } = req;
    const { company } = user;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const role = req.query.role || "manager";

    const filter = { company };
    if (role) filter.role = role;

    const [users, total] = await Promise.all([
      User.find(filter, { password: 0, __v: 0, company: 0 })
        .populate({
          path: "avatar",
          select: "fileUrl -_id",
        })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ]);

    res.status(200).json({
      status: "success",
      results: users.length,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      data: users,
    });
  } catch (err) {
    next(new AppError(err.message || "Failed to fetch employees", 500));
  }
};
