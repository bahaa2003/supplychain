import mongoose from "mongoose";
import { orderStatusEnum } from "../enums/orderStatus.enum.js";
import { paymentStatusEnum } from "../enums/paymentStatus.enum.js";
const { Schema } = mongoose;

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
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: orderStatusEnum,
      default: "Draft",
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        unitPrice: {
          type: Number,
          required: true,
        },
        subtotal: {
          type: Number,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    notes: {
      type: String,
    },
    requestedDeliveryDate: {
      type: Date,
    },
    confirmedDeliveryDate: {
      type: Date,
    },
    deliveryAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    billingAddress: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    shipments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Shipment",
      },
    ],
    documents: [
      {
        type: Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
    paymentTerms: {
      type: String,
    },
    paymentStatus: {
      type: String,
      enum: paymentStatusEnum,
      default: "Pending",
    },
    tags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);
