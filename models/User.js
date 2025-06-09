import mongoose from "mongoose";
import { roleEnum } from "../enums/role.enum.js";
import { userStatusEnum } from "../enums/userStatus.enum.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: function () {
        return this.status !== "invited";
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
      default: "staff",
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: function () {
        return this.role !== "platform_admin";
      },
    },
    isEmailVerified: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String },
    status: { type: String, enum: userStatusEnum, default: "active" },
    inviteToken: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    passwordChangeAt: { type: Date },
    // expiresAt: {
    //   type: Date,
    //   default: () => new Date(Date.now() + 1 * 5 * 60 * 1000),
    //   // index: { expireAfterSeconds: 0 },
    // },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
