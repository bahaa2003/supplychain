import mongoose from "mongoose";
const { Schema } = mongoose;

const auditSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
    },
    action: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      enum: [
        "User",
        "Company",
        "Order",
        "Shipment",
        "Inventory",
        "Document",
        "Partner",
        "API",
        "System",
      ],
      required: true,
    },
    entityId: {
      type: Schema.Types.ObjectId,
    },
    previousData: {
      type: Object,
    },
    newData: {
      type: Object,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Audit", auditSchema);
