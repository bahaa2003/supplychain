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
      enum: ["Pending", "Accepted", "Rejected", "Terminated"],
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
      required: true,
    },
    visibilitySettings: {
      orders: { type: Boolean, default: true },
      inventory: { type: Boolean, default: true },
      documents: { type: Boolean, default: true },
      shipments: { type: Boolean, default: true },
      analytics: { type: Boolean, default: false },
    },
    notes: {
      type: String,
      maxlength: 500,
    },
    rejectionReason: {
      type: String,
      maxlength: 500,
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
    terminationReason: {
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

// Compound indexes for common queries
partnerConnectionSchema.index({ requester: 1, recipient: 1, status: 1 });
partnerConnectionSchema.index({ requester: 1, partnershipType: 1, status: 1 });
partnerConnectionSchema.index({ recipient: 1, partnershipType: 1, status: 1 });

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

// Add method to check if connection is active
partnerConnectionSchema.methods.isActive = function () {
  return this.status === "Accepted";
};

// Add method to check if connection is pending
partnerConnectionSchema.methods.isPending = function () {
  return this.status === "Pending";
};

// Add method to check if connection is terminated
partnerConnectionSchema.methods.isTerminated = function () {
  return this.status === "Terminated";
};

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
