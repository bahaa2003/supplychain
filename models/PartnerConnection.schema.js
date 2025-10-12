import mongoose from "mongoose";
import {
  partnerConnectionStatus,
  partnerConnectionStatusEnum,
  terminationTypeEnum,
} from "../enums/partnerConnectionStatus.enum.js";
const { Schema } = mongoose;

const partnerConnectionSchema = new Schema(
  {
    requester: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    status: {
      type: String,
      enum: partnerConnectionStatusEnum,
      default: partnerConnectionStatus.PENDING,
    },
    lastInteractionAt: {
      type: Date,
      default: Date.now,
    },
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    acceptedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    chatRoom: { type: Schema.Types.ObjectId, ref: "ChatRoom" },
    rejectedBy: { type: Schema.Types.ObjectId, ref: "User" },
    inactiveBy: { type: Schema.Types.ObjectId, ref: "User" },
    terminatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    acceptedAt: { type: Date },
    rejectedAt: { type: Date },
    terminatedAt: { type: Date },
    inactiveAt: { type: Date },
    terminationReason: {
      type: String,
      maxlength: 500,
    },
    inactiveReason: {
      type: String,
      maxlength: 500,
    },
    rejectionReason: {
      type: String,
      maxlength: 500,
    },
    terminationType: {
      type: String,
      enum: terminationTypeEnum,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent self-connection
partnerConnectionSchema.pre("save", function (next) {
  if (this.requester.toString() === this.recipient.toString()) {
    next(new Error("A company cannot connect with itself"));
  }
  if (this.isModified("status")) {
    this.lastInteractionAt = new Date();
  }
  next();
});

export default mongoose.model("PartnerConnection", partnerConnectionSchema);
