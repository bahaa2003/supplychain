import mongoose from "mongoose";
const { Schema } = mongoose;
const companySchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    industry: { type: String },
    size: { type: String },
    location: { type: String },
    isApproved: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    budget: {
      type: Number,
      default: 0,
    },

    // expiresAt: {
    //   type: Date,
    //   default: () => new Date(Date.now() + 1 * 5 * 60 * 1000),
    //   // index: { expireAfterSeconds: 0 },
    // },
  },
  { timestamps: true }
);

export default mongoose.model("Company", companySchema);
