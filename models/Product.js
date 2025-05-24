const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    category: {
      type: String,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "USD",
    },
    unit: {
      type: String,
      default: "piece",
    },
    weight: {
      value: Number,
      unit: {
        type: String,
        enum: ["kg", "lb", "g", "oz"],
      },
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ["cm", "in", "m", "ft"],
      },
    },
    images: [
      {
        type: String,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
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

const Product = mongoose.model("Product", productSchema);
