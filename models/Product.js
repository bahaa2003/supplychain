import mongoose from "mongoose";
import { unitEnum } from "../enums/unit.enum.js";

const { Schema } = mongoose;

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    sku: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    unit: {
      type: String,
      enum: unitEnum,
      default: "piece",
    },
    // Used to link to an original supplier's product if this is a reseller's product
    supplierInfo: {
      supplierId: { type: Schema.Types.ObjectId, ref: "Company" },
      supplierS_S_K_U: String,
    },
    category: String,
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure SKU is unique per company
productSchema.index({ company: 1, sku: 1 }, { unique: true });

export default mongoose.model("Product", productSchema);
