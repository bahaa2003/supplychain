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
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

orderSchema.virtual("totalQuantity").get(function () {
  return this.items.reduce((acc, item) => acc + item.quantity, 0);
});
orderSchema.virtual("totalAmount").get(function () {
  this.totalAmount = this.items.reduce((acc, item) => acc + item.subtotal, 0);
});

export default mongoose.model("Order", orderSchema);
