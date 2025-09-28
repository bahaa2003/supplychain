import mongoose from "mongoose";
const { Schema } = mongoose;

const companySchema = new Schema(
  {
    companyName: { type: String, required: true, unique: true },
    industry: { type: String },
    size: { type: String },
    location: { type: Schema.Types.ObjectId, ref: "Location" },

    isApproved: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },

    budget: { type: Number, default: 0 },

    subscription: {
      plan: {
        type: String,
        enum: ["Free", "Basic", "Pro", "Enterprise"],
        default: "Free",
      },
      status: {
        type: String,
        enum: ["active", "inactive", "expired"],
        default: "active",
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
