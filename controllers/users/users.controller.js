import User from "../../models/User.js";
import { AppError } from "../../utils/AppError.js";

export const get_all_employee = async (req, res, next) => {
  const { user } = req;
  const { company } = user;
  const users = await User.find({ company }, { password: false, __v: false })
    .populate({
      path: "company",
      select: "-__v",
    })
    .lean();
  if (!users)
    return next(new AppError("Invalid or expired invitation token", 400));

  res.status(200).json({
    status: "success",
    data: users,
  });
};
