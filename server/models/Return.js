const mongoose = require('mongoose');

const returnSchema = new mongoose.Schema(
  {
    order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', default: null }, // FIX Bug 4: needed for restock
    // Snapshot fields for admin display
    productName: { ar: String, en: String },
    productImage: String,
    selectedColor: { type: String, default: null }, // FIX Bug 4: which variant to restock
    quantity: { type: Number, default: 1 },
    stockRestored: { type: Boolean, default: false }, // FIX Bug 4: prevent double-restock
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
