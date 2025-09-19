import mongoose from "mongoose";
import { orderStatus, orderStatusEnum } from "../enums/orderStatus.enum.js";

const { Schema } = mongoose;
// Inventory model for managing product stock levels across different locations
const orderStatusHistorySchema = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
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

export default mongoose.model("OrderStatusHistory", orderStatusHistorySchema);
