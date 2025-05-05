import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { userModel } from "../models/User.js";
import { catchError } from "../middleware/catchError.js";
import { AppError } from "../utils/AppError.js";

export const signUp = catchError(async (req, res, next) => {
  let isFound = await userModel.findOne({ email: req.body.email });
  if (isFound) return next(new AppError("email already in use", 409));

  let user = new userModel(req.body);
  await user.save();
  res.json({ message: "success", user });
});

export const signIn = catchError(async (req, res, next) => {
  const { password, email } = req.body;
  const isFound = await userModel.findOne({ email });
  const match = await bcrypt.compare(password, isFound.password);
  if (isFound && match) {
    let token = jwt.sign(
      { name: isFound.name, userId: isFound._id, role: isFound.role },
      "myNameIsToken"
    );
    return res.json({ message: "success", token });
  }
  next(new AppError("email or password not found", 401));
});

export const protectedRouts = catchError(async (req, res, next) => {
  const { token } = req.headers;
  if (!token) return next(new AppError("unauthorized", 401));

  const decoded = jwt.verify(token, "myNameIsToken");

  let user = await userModel.findById(decoded.userId);
  if (!user) return next(new AppError("unauthorized", 401));

  if (user.passwordChangeAt) {
    let ChangePasswordDate = parseInt(user.passwordChangeAt.getTime() / 1000);
    if (ChangePasswordDate > decoded.iat)
      return next(new AppError("unauthorized", 401));
  }

  req.user = user;
  next();
});

export const allowedTo = (...roles)=>{
  return catchError(async (req, res, next)=>{
    if(!roles.includes(req.user.role)) return next(new AppError("unauthorized, you are "+req.user.role, 401));
    next();
  });
}
