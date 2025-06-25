import mongoose from "mongoose";
import { currencyEnum } from "../enums/currency.enum.js";
import { unitEnum } from "../enums/unit.enum.js";
const { Schema } = mongoose;
const productSchema = new Schema(
  {
    ProductName: {
      type: String,
      required: true,
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
    },
    category: {
      type: String,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      enum: currencyEnum,
      default: "USD",
    },
    unit: {
      type: String,
      enum: unitEnum,
      default: "piece",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);
