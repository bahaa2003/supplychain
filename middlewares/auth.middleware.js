import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { AppError } from "../utils/AppError.js";
import { catchError } from "../utils/catchError.js";

export const protectedRoute = catchError(async (req, res, next) => {
  const token = req.headers.token || req.headers.authorization?.split(" ")[1];
  if (!token)
    return next(new AppError("Unauthorized - No token provided", 401));

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).populate("company");

  if (!user) return next(new AppError("Unauthorized - User not found", 401));

  if (user.passwordChangeAt) {
    const pwdChangedTimestamp = parseInt(
      user.passwordChangeAt.getTime() / 1000
    );
    if (pwdChangedTimestamp > decoded.iat)
      return next(
        new AppError("Unauthorized - Password changed after token issued", 401)
      );
  }

  req.user = user;
  req.decoded = decoded;
  next();
});

export const allowedTo = (...roles) => {
  return catchError(async (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError(`Unauthorized - Role ${req.user.role} not allowed`, 403)
      );
    next();
  });
};

export const checkEmailVerified = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return next(new AppError("Email is not verified", 403));
  }
  next();
};

export const checkTwoFactorEnabled = (req, res, next) => {
  if (!req.user.isTwoFactorEnabled) {
    return next(new AppError("Two-factor authentication is not enabled", 403));
  }
  next();
};
