import User from "../../models/User.js";
import speakeasy from "speakeasy";
import { AppError } from "../../utils/AppError.js";

import { generateToken } from "../../utils/generateToken.js";

export const confirm2FALogin = async (req, res, next) => {
  const { userId, token } = req.body;

  const user = await User.findById(userId);
  if (!user || !user.twoFactorEnabled)
    return next(new AppError("Invalid request", 400));

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: "base32",
    token,
  });

  if (!verified) return next(new AppError("Invalid 2FA code", 401));

  const authToken = generateToken(user);
  res.status(200).json({ token: authToken });
};
