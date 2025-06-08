import User from "../../models/User.js";
import Company from "../../models/Company.js";
import { AppError } from "../../utils/AppError.js";
import { sendValidEmail } from "../../utils/email.js";
import { generateToken } from "../../utils/generateToken.js";
import bcrypt from "bcrypt";

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
  await sendValidEmail(email);
  await company.save();
  await user.save();

  const token = generateToken(user);

  res.status(201).json({
    status: "success",
    message: "Company registered. Waiting for approval.",
    token,
  });
};
