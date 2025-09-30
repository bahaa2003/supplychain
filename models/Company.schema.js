import mongoose from "mongoose";
const { Schema } = mongoose;
import {
  companyIndustries,
  companyIndustriesEnum,
  companySizes,
  companySizesEnum,
  companySizesNumber,
  companySizesNumberEnum,
  subscriptionPlans,
  subscriptionPlansEnum,
  subscriptionStatuses,
  subscriptionStatusesEnum,
} from "../enums/company.enum.js";
const companySchema = new Schema(
  {
    companyName: { type: String, required: true, unique: true },
    industry: { type: String, enum: companyIndustriesEnum },
    size: { type: String, enum: companySizesEnum, default: companySizes.SMALL },
    location: { type: Schema.Types.ObjectId, ref: "Location" },

    isApproved: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },

    budget: { type: Number, default: 0 },

    subscription: {
      plan: {
        type: String,
        enum: subscriptionPlansEnum,
        default: subscriptionPlans.FREE,
      },
      status: {
        type: String,
        enum: subscriptionStatusesEnum,
        default: subscriptionStatuses.ACTIVE,
      },
      startDate: { type: Date, default: Date.now },
      endDate: { type: Date },
      stripeCustomerId: { type: String },
      stripeSubscriptionId: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Company", companySchema);
