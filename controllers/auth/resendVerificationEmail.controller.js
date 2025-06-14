import User from "../../models/User.js";
import { AppError } from "../../utils/AppError.js";
import sendEmail from "../../services/email.service.js";

export const resendVerificationEmail = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    console.log("user verification status:", user.isEmailVerified);
    if (user.isEmailVerified)
      return next(new AppError("Email already verified", 400));
    // Extend the expire time by 1 day
    const email = user.email;
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    sendEmail(
      "verifyEmail",
      {
        verifyLink: `${process.env.BACKEND_URL}/api/auth/verify/${token}`,
      },
      [user]
    );
    // Update the user's verification token and expire time
    res.status(200).json({
      message: "Verification email resent and expire extended by 1 day.",
    });
  } catch (err) {
    return next(
      new AppError(
        "Failed to resend verification email or extend expire please try again later" +
          " - " +
          err.message,
        500
      )
    );
  }
};
