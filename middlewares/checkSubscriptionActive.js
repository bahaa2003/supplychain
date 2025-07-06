import Company from "../models/Company.js";
import { AppError } from "../utils/AppError.js";

export const checkSubscriptionActive = async (req, res, next) => {
  try {
    const company = req.user.company;

    if (!company || company.subscription?.status !== "active") {
      throw new AppError(
        "Your company subscription is not active. Please upgrade your plan.",
        403
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};
