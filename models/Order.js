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
    // مشاكل تم اكتشافها أثناء التحقق
    issues: [
      {
        sku: String,
        problem: String, // e.g., 'price_changed', 'insufficient_quantity', 'product_inactive'
        current_price: Number,
        available_quantity: Number,
      },
    ],
    // معلومات الإرجاع
    returnInfo: {
      returnItems: [
        {
          productId: { type: Schema.Types.ObjectId, ref: "Product" },
          quantity: Number,
          reason: String,
        },
      ],
      returnReason: String,
      isPartialReturn: { type: Boolean, default: false },
      returnedBy: { type: Schema.Types.ObjectId, ref: "User" },
      returnedAt: Date,
    },
    // معالجة الإرجاع (من جانب المورد)
    returnProcessing: {
      acceptedItems: [
        {
          productId: { type: Schema.Types.ObjectId, ref: "Product" },
          quantity: Number,
          reason: String,
        },
      ],
      rejectedItems: [
        {
          productId: { type: Schema.Types.ObjectId, ref: "Product" },
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

// Virtual للحصول على الدور الحالي للمستخدم
orderSchema.virtual("userRole").get(function () {
  // يجب تعيين هذا من الكونترولر
  return this._userRole;
});

orderSchema.set("toJSON", { virtuals: true });
orderSchema.set("toObject", { virtuals: true });

export default mongoose.model("Order", orderSchema);
