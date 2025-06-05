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
      enum: ["Pending", "Accepted", "Rejected"],
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
    notes: { type: String },
    rejectionReason: { type: String },
    invitedBy: { type: Schema.Types.ObjectId, ref: "User" },
    acceptedBy: { type: Schema.Types.ObjectId, ref: "User" },
    acceptedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("PartnerConnection", partnerConnectionSchema);
