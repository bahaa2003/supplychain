import mongoose from "mongoose";
import { currencyEnum } from "../enums/currency.enum.js";
import { unitEnum } from "../enums/unit.enum.js";
const { Schema } = mongoose;
const productSchema = new Schema(
  {
    name: {
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
    description: {
      type: String,
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
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ["kg", "lb", "g", "oz"],
      },
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ["cm", "in", "m", "ft"],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    relatedProducts: [
      {
        type: Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Product", productSchema);
