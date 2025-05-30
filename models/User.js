import mongoose from "mongoose";
import bcrypt from "bcrypt";
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
      required: function () {
        return this.status !== "invited";
      },
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
    expiresAt: {
      type: Date,
      default: function () {
        return this.isEmailVerified
          ? undefined
          : new Date(Date.now() + 24 * 60 * 60 * 1000);
      },
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

export default mongoose.model("User", userSchema);
