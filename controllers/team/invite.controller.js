import User from "../../models/User.js";
import jwt from "jsonwebtoken";
import { AppError } from "../../utils/AppError.js";
import { sendTeamInviteEmail } from "../../utils/email.js";
import { roleEnum } from "../../enums/role.enum.js";
import bcrypt from "bcrypt";
export const inviteUser = async (req, res, next) => {
  const { email, role, name } = req.body;
  const admin = req.user;

  if (!roleEnum.includes(role)) {
    return next(new AppError("Invalid role specified", 400));
  }

  if (admin.role !== "admin")
    return next(new AppError("Only admins can invite team members.", 403));
  console.log(admin);
  const existingUser = await User.findOne({
    email,
    $or: [{ status: { $ne: "invited" } }, { inviteToken: { $exists: true } }],
  });

  if (existingUser) {
    return next(
      new AppError("User already exists or has a pending invite", 400)
    );
  }

  const token = jwt.sign(
    { email, companyId: admin.company._id, role },
    process.env.JWT_SECRET,
    { expiresIn: "2d" }
  );

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 2);
  const password = Math.random().toString(36).substring(2, 15);
  await User.create({
    name,
    email,
    role,
    password: bcrypt.hashSync(password, 12),
    company: admin.company._id,
    status: "invited",
    inviteToken: token,
    expiresAt,
  });

  const inviteLink = `${process.env.BACKEND_URL}/api/team/verify-invite/${token}`;

  await sendTeamInviteEmail(email, password, inviteLink, admin.name);

  res.status(201).json({
    message: "User invited successfully.",
    inviteLink,
  });
};
