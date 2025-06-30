import mongoose from "mongoose";
import { orderStatus, orderStatusEnum } from "../enums/orderStatus.enum.js";

const { Schema } = mongoose;

const orderItemSchema = new Schema({
  sku: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  subtotal: {
    type: Number,
    required: true,
  },
});

const orderStatusHistorySchema = new Schema(
  {
    status: {
      type: String,
      enum: orderStatusEnum,
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    notes: String,
  },
  { timestamps: true }
);

const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: orderStatusEnum,
      default: orderStatus.CREATED,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    deliveryLocation: {
      type: Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    notes: String,
    requestedDeliveryDate: Date,
    confirmedDeliveryDate: Date,
    shipments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Shipment",
      },
    ],
    invoice: {
      type: Schema.Types.ObjectId,
      ref: "Invoice",
    },
    history: [orderStatusHistorySchema],
    // problems found during validation
    issues: [
      {
        sku: String,
        problem: String, // e.g., 'price_changed', 'insufficient_quantity', 'product_inactive'
        current_price: Number,
        available_quantity: Number,
      },
    ],
    // return information
    returnInfo: {
      returnItems: [
        {
          sku: String,
          quantity: Number,
          reason: String,
        },
      ],
      returnReason: String,
      isPartialReturn: { type: Boolean, default: false },
      returnedBy: { type: Schema.Types.ObjectId, ref: "User" },
      returnedAt: Date,
    },
    // return processing (supplier side)
    returnProcessing: {
      acceptedItems: [
        {
          sku: String,
          quantity: Number,
          reason: String,
        },
      ],
      rejectedItems: [
        {
          sku: String,
          quantity: Number,
          reason: String,
        },
      ],
      processingNotes: String,
      processedBy: { type: Schema.Types.ObjectId, ref: "User" },
      processedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-calculate totalAmount before saving
orderSchema.pre("save", function (next) {
  if (this.isModified("items")) {
    this.totalAmount = this.items.reduce((acc, item) => acc + item.subtotal, 0);
  }
  next();
});

export default mongoose.model("Order", orderSchema);
