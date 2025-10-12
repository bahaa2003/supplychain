import User from "../../models/User.schema.js";
import bcrypt from "bcrypt";
import { AppError } from "../../utils/AppError.js";

import { generateToken } from "../../utils/generateToken.js";

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).populate("company");
  console.log("User found:", user);
  if (!user) throw new AppError("Invalid email or password", 401);

  const isMatch = await bcrypt.compare(password, user.password);
  console.log("Password match:", isMatch);
  if (!isMatch) throw new AppError("Invalid email or password", 401);

  if (user.twoFactorEnabled) {
    return res.status(200).json({
      message: "2FA code required",
      twoFactor: true,
      userId: user._id,
    });
  }

  const token = generateToken(user);
  res.status(200).json({ status: "success", token, role: user.role });
};
