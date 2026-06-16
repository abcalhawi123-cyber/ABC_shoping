const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    // Admin types these manually — no dropdowns
    name: {
      ar: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    category: {
      ar: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    description: {
      ar: { type: String, required: true },
      en: { type: String, required: true },
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String }, // Cloudinary public_id for deletion
      },
    ],
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: 0,
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100, // percentage
    },
    stock: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: 0,
      default: 0,
    },
    sold: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // Computed field for quick low-stock alerts
    isLowStock: {
      type: Boolean,
      default: false,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    // SEO
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
);

// Virtual: effective price after discount
productSchema.virtual('effectivePrice').get(function () {
  return this.sellingPrice * (1 - this.discount / 100);
});

// Virtual: net profit per unit
productSchema.virtual('netProfit').get(function () {
  return this.effectivePrice - this.costPrice;
});

// Auto-update isLowStock whenever stock changes
productSchema.pre('save', function (next) {
  this.isLowStock = this.stock < 5;

  // Auto-generate slug from English name if not set
  if (!this.slug && this.name?.en) {
    this.slug =
      this.name.en
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') +
      '-' +
      Date.now();
  }

  next();
});

// Indexes for search performance
productSchema.index({ 'name.ar': 'text', 'name.en': 'text', 'category.ar': 'text', 'category.en': 'text' });
productSchema.index({ sellingPrice: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ sold: -1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isLowStock: 1 });

module.exports = mongoose.model('Product', productSchema);
