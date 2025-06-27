import mongoose from "mongoose";
import { locationTypeEnum } from "../enums/locationType.enum.js";
const { Schema } = mongoose;
// Inventory model for managing product stock levels across different locations
const locationSchema = new Schema(
  {
    locationName: {
      type: String,
      required: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    type: {
      type: String,
      enum: locationTypeEnum,
      default: "Warehouse",
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    contactPerson: {
      name: String,
      email: String,
      phone: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    coordinates: {
      latitude: Number,
      longitude: Number,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Location", locationSchema);
