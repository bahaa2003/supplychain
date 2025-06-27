import mongoose from "mongoose";
import { orderStatus, orderStatusEnum } from "../enums/orderStatus.enum.js";

const { Schema } = mongoose;

const orderItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  sku: {
    type: String,
    required: true,
  },
  name: {
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
      index: true,
    },
    buyer: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    supplier: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
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
    // To store issues found during the 'approve' step validation
    issues: [
      {
        sku: String,
        problem: String, // e.g., 'price_changed', 'insufficient_quantity'
        current_price: Number,
        available_quantity: Number,
      },
    ],
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

// Add initial status to history when creating a new order
orderSchema.pre("save", function (next) {
  if (this.isNew) {
    this.history.push({
      status: this.status,
      updatedBy: this.createdBy,
      notes: "Order created.",
    });
  }
  next();
});

export default mongoose.model("Order", orderSchema);
