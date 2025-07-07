import User from "../../models/User.schema.js";
import crypto from "crypto";
import { AppError } from "../../utils/AppError.js";
import sendEmail from "../../services/email.service.js";

export const forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user)
    return next(new AppError("User with this email does not exist", 404));

  const resetToken = crypto.randomBytes(32).toString("hex");
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const passwordResetExpires = Date.now() + 10 * 60 * 1000;

  user.passwordResetToken = passwordResetToken;
  user.passwordResetExpires = passwordResetExpires;
  await user.save({ validateBeforeSave: false });

  const resetURL = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  try {
    sendEmail(
      "resetPassword",
      {
        resetLink: resetURL,
      },
      [user]
    );
    res.status(200).json({
      status: "success",
      message: "Password reset email sent.",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("Error sending email. Try again later.", 500));
  }
};
