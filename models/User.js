import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "manager", "staff", "platform_admin"],
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
    status: { type: String, enum: ["active", "invited"], default: "active" },
    inviteToken: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    passwordChangeAt: { type: Date },
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
