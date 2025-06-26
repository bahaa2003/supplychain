import mongoose from "mongoose";
import { inventoryChangeTypeEnum } from "../enums/inventoryChangeType.enum.js";
import { inventoryReferenceTypeEnum } from "../enums/inventoryReferenceType.enum.js";

const { Schema } = mongoose;

const inventoryHistorySchema = new Schema(
  {
    inventory: {
      type: Schema.Types.ObjectId,
      ref: "Inventory",
      required: true,
      index: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    changeType: {
      type: String,
      enum: inventoryChangeTypeEnum,
      required: true,
    },
    quantityChange: {
      // Can be positive or negative
      onHand: { type: Number, default: 0 },
      reserved: { type: Number, default: 0 },
    },
    before: {
      onHand: { type: Number, required: true },
      reserved: { type: Number, required: true },
    },
    after: {
      onHand: { type: Number, required: true },
      reserved: { type: Number, required: true },
    },
    reason: String, // Optional: 'Manual adjustment by admin', 'Order fulfillment'
    referenceType: {
      type: String,
      enum: inventoryReferenceTypeEnum,
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "referenceType", // Dynamic reference to Order, Shipment, etc.
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("InventoryHistory", inventoryHistorySchema);
