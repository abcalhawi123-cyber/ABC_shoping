const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { ar: String, en: String },        // Snapshot at time of purchase
  image: String,
  selectedColor: { type: String, default: null }, // which color variant was purchased
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
    codFee: { type: Number, default: 0 },    // Extra 12 EGP fee for Cash on Delivery
    total: { type: Number, required: true },

    // Payment
    paymentMethod: {
      type: String,
      enum: ['cod', 'instapay'],
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
    refundAmount: { type: Number, default: 0 }, // productPrice + (2 × shippingFee)

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

// Bulk auto-restock on status change removed. Restocking is now handled
// exclusively per-item through return.routes.js (PATCH /api/returns/:id),
// which correctly respects color variants and prevents double-restock,
// and also sets order.status = 'مرتجع' + calculates refundAmount itself.
// This hook only tracks status history.
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
