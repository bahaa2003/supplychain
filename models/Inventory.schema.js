import mongoose from "mongoose";
import { inventoryStatus } from "../enums/inventoryStatus.enum.js";
import { unitEnum } from "../enums/unit.enum.js";
import { AppError } from "../utils/AppError.js";

const { Schema } = mongoose;

// Inventory model for managing product stock levels across different locations
const inventorySchema = new Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
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
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      // required: true,
    },
    onHand: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    reserved: {
      type: Number,
      default: 0,
      min: 0,
    },
    minimumThreshold: {
      type: Number,
      default: 10,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for available quantity
inventorySchema.virtual("available").get(function () {
  return this.onHand - this.reserved;
});

// Virtual for inventory status
inventorySchema.virtual("status").get(function () {
  const available = this.onHand - this.reserved;
  if (available <= 0) {
    return inventoryStatus.OUT_OF_STOCK;
  }
  if (available < this.minimumThreshold) {
    return inventoryStatus.LOW_STOCK;
  }
  return inventoryStatus.IN_STOCK;
});

inventorySchema.index({ company: 1, productName: 1 }, { unique: true });

inventorySchema.index({ company: 1, sku: 1 }, { unique: true });

inventorySchema.index({ location: 1 });

inventorySchema.index({ company: 1, location: 1, isActive: 1 });

// Ensure reserved quantity does not exceed onHand quantity
inventorySchema.pre("save", function (next) {
  if (this.reserved > this.onHand) {
    return next(
      new AppError("Reserved quantity cannot exceed on-hand quantity.", 400)
    );
  }
  this.lastUpdated = new Date();
  next();
});

// handle duplicated entry
inventorySchema.post("save", function (error, doc, next) {
  if (error.code === 11000) {
    if (error.keyPattern?.sku) {
      next(new AppError("Product SKU already exists for this company", 400));
    } else if (error.keyPattern?.productName) {
      next(new AppError("Product name already exists for this company", 400));
    } else {
      next(new AppError("Duplicate entry", 400));
    }
  } else {
    next();
  }
});

export default mongoose.model("Inventory", inventorySchema);
