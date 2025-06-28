import mongoose from "mongoose";
const { Schema } = mongoose;
const companySchema = new Schema(
  {
    companyName: { type: String, required: true, unique: true },
    industry: { type: String },
    size: { type: String },
    location: { type: mongoose.Schema.Types.ObjectId, ref: "Location" },
    isApproved: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    budget: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Company", companySchema);
