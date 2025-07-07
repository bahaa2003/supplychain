import speakeasy from "speakeasy";
import User from "../../models/User.schema.js";
import { AppError } from "../../utils/AppError.js";

export const enable2FA = async (req, res, next) => {
  const user = req.user;

  if (user.twoFactorEnabled)
    return next(new AppError("2FA already enabled", 400));

  const secret = speakeasy.generateSecret({
    name: `ChainFlow (${user.email})`,
  });
  user.twoFactorSecret = secret.base32;
  await user.save();

  res.status(200).json({
    message: "2FA secret generated",
    otpauth_url: secret.otpauth_url,
    base32: secret.base32,
  });
};
