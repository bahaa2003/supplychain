import User from "../../models/User.js";
import Company from "../../models/Company.js";
import jwt from "jsonwebtoken";

export const verifyEmail = async (req, res, next) => {
  const { token } = req.params;

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err)
      return res.status(400).json({ message: "Invalid or expired token" });
    const { email } = decoded;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({
        message: "Registration session expired, please sign up again",
      });
    user.isEmailVerified = true;
    user.expiresAt = undefined;
    await user.save();
    // Remove the expiresAt field from the user document
    user.set("expiresAt", undefined, { strict: false });
    await User.updateOne({ _id: user._id }, { $unset: { expiresAt: 1 } });
    // Also update company
    const company = await Company.findById(user.company);
    company.expiresAt = undefined;
    // Remove the expiresAt field from the document
    company.set("expiresAt", undefined, { strict: false });
    await Company.updateOne({ _id: company._id }, { $unset: { expiresAt: 1 } });
    res.status(200).json({
      message: "Verification Completed. You can now log in.",
    });
  });
};
