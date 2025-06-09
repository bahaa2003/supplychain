import User from "../../models/User.js";
import Company from "../../models/Company.js";
import { sendValidEmail } from "../../utils/email.js";
import { AppError } from "../../utils/AppError.js";

export const resendVerificationEmail = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    console.log("user verification status:", user.isEmailVerified);
    if (user.isEmailVerified)
      return next(new AppError("Email already verified", 400));
    // Extend TTL by 1 day from now
    // user.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    // await user.save();
    // if (user.company) {
    //   const company = await Company.findById(user.company);
    //   if (company && !company.isApproved) {
    //     company.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    //     await company.save();
    //   }
    // }
    await sendValidEmail(user.email);
    res.status(200).json({
      message: "Verification email resent and TTL extended by 1 day.",
    });
  } catch (err) {
    return next(
      new AppError(
        "Failed to resend verification email or extend TTL please try again later" +
          " - " +
          err.message,
        500
      )
    );
  }
};
