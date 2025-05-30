import mongoose from "mongoose";
const { Schema } = mongoose;
import { inventoryStatusEnum } from "../enums/inventoryStatus.enum.js";
// Inventory model for managing product stock levels across different locations
const inventorySchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: "Location",
    },
    currentQuantity: {
      type: Number,
      required: true,
      default: 0,
    },
    reservedQuantity: {
      type: Number,
      default: 0,
    },
    availableQuantity: {
      type: Number,
      default: 0,
    },
    minimumThreshold: {
      type: Number,
      default: 10,
    },
    maximumThreshold: {
      type: Number,
    },
    reorderPoint: {
      type: Number,
    },
    reorderQuantity: {
      type: Number,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    batchNumber: {
      type: String,
    },
    expiryDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: inventoryStatusEnum,
      required: true,
      default: "In Stock",
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for available quantity
inventorySchema.virtual("available").get(function () {
  return this.currentQuantity - this.reservedQuantity;
});

export default mongoose.model("Inventory", inventorySchema);
