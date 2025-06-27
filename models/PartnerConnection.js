import mongoose from "mongoose";
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
      enum: [
        "Pending",
        "Cancelled",
        "Active",
        "Rejected",
        "Inactive",
        "Completed",
        "Expired",
        "Terminated",
      ],
      default: "Pending",
    },
    partnershipType: {
      type: String,
      enum: [
        "Supplier",
        "Manufacturer",
        "Logistics",
        "Warehouse",
        "Retailer",
        "Other",
      ],
      // required: true,
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
      enum: ["Terminated", "Completed", "Expired", "Cancelled"],
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
  next();
});

// Update lastInteractionAt on status change
partnerConnectionSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.lastInteractionAt = new Date();
  }
  next();
});

// Add method to terminate connection
partnerConnectionSchema.methods.terminate = async function (userId, reason) {
  this.status = "Terminated";
  this.terminatedAt = new Date();
  this.terminatedBy = userId;
  this.terminationReason = reason;
  return this.save();
};

// Add static method to find active connections
partnerConnectionSchema.statics.findActiveConnections = function (companyId) {
  return this.find({
    $or: [{ requester: companyId }, { recipient: companyId }],
    status: "Accepted",
  }).populate("requester recipient");
};

// Add static method to find pending requests
partnerConnectionSchema.statics.findPendingRequests = function (companyId) {
  return this.find({
    recipient: companyId,
    status: "Pending",
  }).populate("requester invitedBy");
};

export default mongoose.model("PartnerConnection", partnerConnectionSchema);
