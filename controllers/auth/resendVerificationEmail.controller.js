import User from "../../models/User.js";
import Company from "../../models/Company.js";
import { sendValidEmail } from "../../utils/email.js";

export const resendVerificationEmail = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isEmailVerified)
      return res.status(400).json({ message: "Email already verified" });
    // Extend TTL by 1 day from now
    user.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();
    if (user.company) {
      const company = await Company.findById(user.company);
      if (company && !company.isApproved) {
        company.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await company.save();
      }
    }
    await sendValidEmail(user.email);
    res.status(200).json({
      message: "Verification email resent and TTL extended by 1 day.",
    });
  } catch (err) {
    next(err);
  }
};
