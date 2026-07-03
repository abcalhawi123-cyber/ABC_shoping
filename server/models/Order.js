const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { ar: String, en: String },        // Snapshot at time of purchase
  image: String,
  selectedColor: { type: String, default: null }, // FIX Bug 2: which color variant was purchased
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },     // effectivePrice at purchase time
  costPrice: { type: Number, required: true },     // for profit calc
  discount: { type: Number, default: 0 },
});

const orderSchema = new mongoose.Schema(
  {
    // Guest orders have no user reference
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Guest / registered customer info
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
    },

    items: [orderItemSchema],

    // Shipping
    shippingAddress: {
      governorate: { ar: String, en: String },
      city: { type: String, required: true },
      street: { type: String, required: true },
      building: String,
    },
    shippingFee: { type: Number, required: true, default: 0 },
    estimatedDeliveryDays: { min: Number, max: Number },

    // Pricing
    subtotal: { type: Number, required: true },
    total: { type: Number, required: true },

    // Payment
    paymentMethod: {
      type: String,
      enum: ['cod', 'instapay', 'card'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'refunded'],
      default: 'pending',
    },
    // InstaPay specific
    instapayTransactionId: String,
    instapayScreenshotUrl: String,
    instapayScreenshotPublicId: String,

    // Paymob card payment
    paymobOrderId: String,
    paymobTransactionId: String,

    // Order pipeline status (Arabic labels for admin panel)
    status: {
      type: String,
      enum: [
        'قيد المراجعة',    // Under Review
        'جاري التجهيز',   // Processing
        'تم الشحن',       // Shipped
        'تم التسليم',     // Delivered
        'مرتجع',          // Returned
      ],
      default: 'قيد المراجعة',
    },

    // Tracking
    trackingNumber: String,
    statusHistory: [
      {
        status: String,
        note: String,
        changedAt: { type: Date, default: Date.now },
      },
    ],

    // Returns — 15-day policy from order date
    returnRequestedAt: Date,
    returnApprovedAt: Date,
    returnReason: String,
    isReturnEligible: { type: Boolean, default: true },

    // Flags
    isGuestOrder: { type: Boolean, default: false },

    notes: String, // Admin internal note
  },
  { timestamps: true }
);

// ── Virtuals ──────────────────────────────────────────────

// Total profit for this order
orderSchema.virtual('totalProfit').get(function () {
  return this.items.reduce((sum, item) => {
    return sum + (item.unitPrice - item.costPrice) * item.quantity;
  }, 0);
});

// Check 15-day return eligibility
orderSchema.virtual('canReturn').get(function () {
  if (!this.isReturnEligible) return false;
  const fifteenDays = 15 * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(this.createdAt).getTime() <= fifteenDays;
});

// ── Hooks ─────────────────────────────────────────────────

// FIX Bug 4+7: Bulk restock removed. Restocking is now handled
// exclusively per-item via return.routes.js PATCH /:id, which
// correctly respects color variants and prevents double-restock.
// This hook ONLY tracks status history.
orderSchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status });
  }
  next();
});

// Indexes
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentMethod: 1, paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'customer.email': 1 });

module.exports = mongoose.model('Order', orderSchema);
