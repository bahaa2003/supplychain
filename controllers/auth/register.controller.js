import User from "../../models/User.js";
import Company from "../../models/Company.js";
import { AppError } from "../../utils/AppError.js";
import sendEmail from "../../services/email.service.js";
import NotificationSettings from "../../models/NotificationSettings.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const register = async (req, res, next) => {
  const { name, email, password, companyName, industry, size, location } =
    req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new AppError("Email already registered", 400);

  const existingCompany = await Company.findOne({ name: companyName });
  if (existingCompany) throw new AppError("Company name already taken", 400);

  const company = await Company.create({
    name: companyName,
    industry,
    size,
    location,
    createdBy: null,
    isApproved: false,
  });

  const user = await User.create({
    name,
    email,
    password: bcrypt.hashSync(password, 12),
    role: "admin",
    company: company._id,
    isEmailVerified: false,
  });

  company.createdBy = user._id;
  await company.save();

  await NotificationSettings.create({
    user: user._id,
    email: { enabled: true },
    sms: { enabled: false },
    inApp: { enabled: true },
  });

  const token = jwt.sign({ email }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });
  sendEmail(
    "verifyEmail",
    {
      verifyLink: `http://localhost:${process.env.PORT}/api/auth/verify/${token}`,
    },
    [user]
  );

  res.status(201).json({
    status: "success",
    message:
      "Registration successful! Please check your email to verify your account.",
  });
};
