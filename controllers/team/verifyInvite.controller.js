import User from "../../models/User.js";
import jwt from "jsonwebtoken";
import { AppError } from "../../utils/AppError.js";
import bcrypt from "bcrypt";

export const verifyInvite = async (req, res, next) => {
  const { token } = req.params;

  try {
    // verify tocken
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email, companyId, role } = decoded;

    // find the invited user
    const invitedUser = await User.findOne({
      email,
      company: companyId,
      status: "invited",
      inviteToken: token,
    });

    if (!invitedUser) {
      return next(new AppError("Invalid or expired invitation", 400));
    }

    // verify invitation expiration
    if (invitedUser.expiresAt && new Date() > invitedUser.expiresAt) {
      return next(new AppError("Invitation has expired", 400));
    }

    // update user data
    invitedUser.status = "active";
    invitedUser.isEmailVerified = true;
    invitedUser.inviteToken = undefined;
    invitedUser.expiresAt = undefined;

    await invitedUser.save();
    // Remove the expiresAt field from the invited user document
    await User.updateOne(
      { email },
      {
        $set: { isEmailVerified: true },
        $unset: { expiresAt: 1 },
      }
    );
    res.status(200).json({
      status: "success",
      message: "Registration completed successfully. You can now login.",
      data: {
        email: invitedUser.email,
        name: invitedUser.name,
        role: invitedUser.role,
      },
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(new AppError("Invalid invitation token", 400));
    }
    if (error.name === "TokenExpiredError") {
      return next(new AppError("Invitation token has expired", 400));
    }
    return next(error);
  }
};
