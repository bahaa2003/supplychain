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
      required: true,
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
