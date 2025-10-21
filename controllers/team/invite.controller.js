import User from "../../models/User.schema.js";
import ChatRoom from "../../models/ChatRoom.schema.js";
import jwt from "jsonwebtoken";
import { AppError } from "../../utils/AppError.js";
import { roleEnum } from "../../enums/role.enum.js";
import bcrypt from "bcrypt";
import sendEmail from "../../services/email.service.js";
import mongoose from "mongoose";

export const inviteUser = async (req, res, next) => {
  const { email, role, name } = req.body;
  const admin = req.user;

  if (!roleEnum.includes(role)) {
    return next(new AppError("Invalid role specified", 400));
  }

  if (admin.role !== "admin")
    return next(new AppError("Only admins can invite team members.", 403));
  console.log(admin);
  const existingUser = await User.findOne({
    email,
    $or: [{ status: { $ne: "invited" } }, { inviteToken: { $exists: true } }],
  });

  if (existingUser) {
    return next(
      new AppError("User already exists or has a pending invite", 400)
    );
  }

  const token = jwt.sign(
    { email, companyId: admin.company._id, role },
    process.env.JWT_SECRET,
    { expiresIn: "2d" }
  );

  const password = Math.random().toString(36).substring(2, 15);
  const session = await mongoose.startSession();

  try {
    await session.startTransaction();
    let chatRoom = undefined;
    if (role != "admin") {
      [chatRoom] = await ChatRoom.create(
        [
          {
            type: "in_company",
            company: admin.company._id,
          },
        ],
        { session }
      );
    }

    await User.create(
      [
        {
          ...(chatRoom && { chatRoom: chatRoom._id }),
          name,
          email,
          role,
          password: bcrypt.hashSync(password, 12),
          company: admin.company._id,
          status: "invited",
          inviteToken: token,
        },
      ],
      { session }
    );
    const inviteLink = `${process.env.BACKEND_URL}/api/team/verify-invite/${token}`;

    await sendEmail(
      "teamInvite",
      {
        inviteLink,
        password,
        invitedBy: admin.name,
      },
      [email]
    );
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    return next(new AppError("Failed to invite user", 500));
  } finally {
    session.endSession();
  }

  res.status(201).json({
    message: "User invited successfully.",
    inviteLink,
  });
};
