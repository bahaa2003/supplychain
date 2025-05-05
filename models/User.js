import { Schema, model } from 'mongoose';
import bcrypt, { hashSync } from "bcrypt";

const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    //company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    role: { type: String, enum: ["admin", "manager", "staff"], required: true },
    isVerified: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    lastLogin: { type: Date },
    permissions: [
      {
        module: String,
        canRead: Boolean,
        canWrite: Boolean,
        canDelete: Boolean,
      },
    ],
  },
  { timestamps: true }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 7);
  next();
});

UserSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();
  if (update.password) {
    update.password = await bcrypt.hash(update.password, 7);
  }
  next();
});


export const userModel = model("User", UserSchema);
