import mongoose from "mongoose";
import { notificationTypeEnum } from "../enums/notificationType.enum.js";
import { notificationRelatedEnum } from "../enums/notificationRelated.enum.js";
import { notificationPriorityEnum } from "../enums/notificationPriority.enum.js";
const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: notificationTypeEnum,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    related: {
      type: String,
      enum: notificationRelatedEnum,
    },
    relatedId: {
      type: Schema.Types.ObjectId,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
    priority: {
      type: String,
      enum: notificationPriorityEnum,
      default: "Medium",
    },
    actionRequired: {
      type: Boolean,
      default: false,
    },
    actionLink: {
      type: String,
    },
    sentVia: {
      email: {
        type: Boolean,
        default: false,
      },
      inApp: {
        type: Boolean,
        default: true,
      },
      sms: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Notification", notificationSchema);
