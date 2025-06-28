import mongoose from "mongoose";
import { unitEnum } from "../enums/unit.enum.js";
import { AppError } from "../utils/AppError.js";
const { Schema } = mongoose;

const productSchema = new Schema(
  {
    productName: {
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
      trim: true,
      unique: true,
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
productSchema.index({ company: 1, productName: 1 }, { unique: true });

productSchema.index({ company: 1, sku: 1 }, { unique: true });
productSchema.post("save", function (error, doc, next) {
  if (error.code === 11000) {
    next(new AppError("Product sku already exists", 400));
  } else {
    next();
  }
});
export default mongoose.model("Product", productSchema);
