import mongoose from "mongoose";
import { inventoryStatusEnum } from "../enums/inventoryStatus.enum.js";

const { Schema } = mongoose;

// Inventory model for managing product stock levels across different locations
const inventorySchema = new Schema(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    sku: {
      type: String,
      required: true,
      index: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    location: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      required: true,
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
  },
  {
    timestamps: true,
    versionKey: "__v", // Enable optimistic locking
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index to ensure unique inventory entry per product, company, and location
inventorySchema.index(
  { product: 1, company: 1, location: 1 },
  { unique: true }
);

// Virtual for available quantity
inventorySchema.virtual("available").get(function () {
  return this.onHand - this.reserved;
});

// Virtual for inventory status
inventorySchema.virtual("status").get(function () {
  const available = this.onHand - this.reserved;
  if (available <= 0) {
    return inventoryStatusEnum.OUT_OF_STOCK;
  }
  if (available < this.minimumThreshold) {
    return inventoryStatusEnum.LOW_STOCK;
  }
  return inventoryStatusEnum.IN_STOCK;
});

// Ensure reserved quantity does not exceed onHand quantity
inventorySchema.pre("save", function (next) {
  if (this.reserved > this.onHand) {
    return next(
      new Error("Reserved quantity cannot be greater than on-hand quantity.")
    );
  }
  next();
});

export default mongoose.model("Inventory", inventorySchema);
