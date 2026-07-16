const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null }, // needed for restock
    // Snapshot fields for admin display
    productName: { ar: String, en: String },
    productImage: String,
    selectedColor: { type: String, default: null }, // which variant to restock
    quantity: { type: Number, default: 1 },
    stockRestored: { type: Boolean, default: false }, // prevent double-restock
    refundAmount: { type: Number, default: 0 }, // productPrice + (2 × shippingFee)
    // Customer info snapshot
    customerName: { type: String, required: true },
    customerPhone: { type: String, required: true },
    customerEmail: String,
    // Return details
    reason: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminNote: String,
    resolvedAt: Date,
  },
  { timestamps: true }
);

returnSchema.index({ status: 1 });
returnSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Return', returnSchema);
