import User from "../../models/User.js";
import { AppError } from "../../utils/AppError.js";

export const get_all_employee = async (req, res, next) => {
  try {
    const { user } = req;
    const { company } = user;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const role = req.query.role || "manager"; // Default to 'manager' if not provided
    const filter = { company };
    if (role) filter.role = role;

    const [users, total] = await Promise.all([
      User.find(filter, { password: false, __v: false })
        .populate({ path: "company", select: "-__v" })
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
