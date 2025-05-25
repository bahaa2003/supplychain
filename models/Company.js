import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    industry: { type: String },
    size: { type: String },
    location: { type: String },
    isApproved: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    expiresAt: {
      type: Date,
      default: function () {
        return this.isApproved
          ? undefined
          : new Date(Date.now() + 24 * 60 * 60 * 1000);
      },
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Company", companySchema);
