import mongoose from "mongoose";
import {
  partnerConnectionStatus,
  partnerConnectionStatusEnum,
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
    invitedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    acceptedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    acceptedAt: { type: Date },
    terminatedAt: { type: Date },
    terminatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    terminationType: {
      type: String,
      enum: [
        partnerConnectionStatus.TERMINATED,
        partnerConnectionStatus.COMPLETED,
        partnerConnectionStatus.EXPIRED,
        partnerConnectionStatus.CANCELLED,
      ],
    },
    suspendedBy: { type: Schema.Types.ObjectId, ref: "User" },
    suspendedAt: { type: Date },
    rejectedBy: { type: Schema.Types.ObjectId, ref: "User" },
    rejectedAt: { type: Date },
    rejectionReason: {
      type: String,
      maxlength: 500,
    },
    terminationReason: {
      type: String,
      maxlength: 500,
    },
    suspensionReason: {
      type: String,
      maxlength: 500,
    },
    lastInteractionAt: {
      type: Date,
      default: Date.now,
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
