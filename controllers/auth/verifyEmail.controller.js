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

    // Remove the expiresAt field from the document
    console.log("user company: ", user.company); // user company:  new ObjectId("6845dc758e263f91c3353c13")
    await Company.updateOne({ _id: user.company });
    // Also Remove the expiresAt field from the user document
    await User.updateOne(
      { email },
      {
        $set: { isEmailVerified: true },
      }
    );

    res.status(200).json({
      message: "Verification Completed. You can now log in.",
    });
  });
};
