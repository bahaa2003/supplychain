import { roleEnum } from "../enums/role.enum.js";
import { userStatus, userStatusEnum } from "../enums/userStatus.enum.js";
import { roles } from "../enums/role.enum.js";
import mongoose from "mongoose";
const { Schema } = mongoose;

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: function () {
        return this.status !== userStatus.INVITED;
      },
    },
    email: { type: String, required: true, unique: true },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: roleEnum,
      default: roles.STAFF,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: function () {
        return this.role !== roles.PLATFORM_ADMIN;
      },
    },
    chatRoom: {
      type: Schema.Types.ObjectId,
      ref: "ChatRoom",
    },
    isEmailVerified: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: String,
    status: { type: String, enum: userStatusEnum, default: userStatus.ACTIVE },
    inviteToken: String,
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangeAt: Date,
    avatar: {
      type: Schema.Types.ObjectId,
      ref: "Attachment",
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
