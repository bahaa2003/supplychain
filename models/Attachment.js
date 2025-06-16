import mongoose from "mongoose";

const { Schema } = mongoose;

const attachmentSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
      enum: [
        "company_document",
        "product_image",
        "user_identity",
        "shipment_proof",
        "partnership_agreement",
        "invoice_copy",
        "other"
      ]
    },
    fileUrl: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
    },
    fileId:{
      type: String,
    },
    ownerCompany: {
      type: Schema.Types.ObjectId,
      ref: "Company"
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product"
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    shipment: {
      type: Schema.Types.ObjectId,
      ref: "Shipment"
    },
    invoice: {
      type: Schema.Types.ObjectId,
      ref: "Invoice"
    },
    relatedTo: {
      type: String,
      enum: ["Company", "Product", "User", "Shipment", "Invoice", "Other"]
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    description: {
      type: String
    }
  },
  { timestamps: true }
);

export default mongoose.model("Attachment", attachmentSchema);
