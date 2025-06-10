import mongoose from 'mongoose';
const { Schema } = mongoose;

const invoiceSchema = new Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true
    },

    uuid: {
      type: String,
      default: null
    },

    issueDate: {
      type: Date,
      required: true,
      default: Date.now
    },

    issuer: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },

    receiver: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },

    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: false
        },
        description: {
          type: String,
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        unitPrice: {
          type: Number,
          required: true
        },
        taxRate: {
          type: Number,
          default: 0
        },
        total: {
          type: Number,
          required: true
        }
      }
    ],

    totalSales: {
      type: Number,
      required: true
    },

    totalTax: {
      type: Number,
      required: true
    },

    totalAmount: {
      type: Number,
      required: true
    },

    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'accepted'
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    relatedOrder: {
      type: Schema.Types.ObjectId,
      ref: 'Order'
    }
  },
  { timestamps: true }
);

export default mongoose.model('Invoice', invoiceSchema);
