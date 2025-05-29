import mongoose from "mongoose";
const { Schema } = mongoose;
const inventoryHistorySchema = new Schema(
  {
    inventory: {
      type: Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
    },
    changeType: {
      type: String,
      enum: ["Increase", "Decrease", "Adjustment", "Initial"],
      required: true,
    },
    quantityChange: {
      type: Number,
      required: true,
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      required: true,
    },
    reference: {
      type: String,
    },
    referenceType: {
      type: String,
      enum: ["Order", "Shipment", "Return", "Adjustment", "Other"],
    },
    referenceId: {
      type: Schema.Types.ObjectId,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
export default mongoose.model("InventoryHistory", inventoryHistorySchema);
