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
    },
    changeType: {
      type: String,
      enum: inventoryChangeTypeEnum,
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
      enum: inventoryReferenceTypeEnum,
      required: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      required: true,
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
