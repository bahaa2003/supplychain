import mongoose from "mongoose";

const notificationSettingsSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    email: {
      enabled: { type: Boolean, default: true },
    },
    sms: {
      enabled: { type: Boolean, default: false },
    },
    inApp: {
      enabled: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "NotificationSettings",
  notificationSettingsSchema
);
