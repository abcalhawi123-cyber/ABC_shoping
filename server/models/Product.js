const mongoose = require('mongoose');

// Color variant sub-schema
const colorVariantSchema = new mongoose.Schema({
  color: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0, default: 0 },
}, { _id: false });

const productSchema = new mongoose.Schema(
  {
    name: {
      ar: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    category: {
      ar: { type: String, required: true, trim: true },
      en: { type: String, required: true, trim: true },
    },
    description: {
      ar: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String },
      },
    ],
    costPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0, max: 100 },

    // NEW: color variants replace single stock field
    colorVariants: [colorVariantSchema],

    // Computed total stock (sum of all variants)
    stock: { type: Number, default: 0, min: 0 },

    sold: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    isLowStock: { type: Boolean, default: false },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    slug: { type: String, unique: true, lowercase: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  { timestamps: true }
);

productSchema.virtual('effectivePrice').get(function () {
  return this.sellingPrice * (1 - this.discount / 100);
});

productSchema.virtual('netProfit').get(function () {
  return this.effectivePrice - this.costPrice;
});

// Auto-compute total stock from colorVariants
productSchema.pre('save', function (next) {
  if (this.colorVariants && this.colorVariants.length > 0) {
    this.stock = this.colorVariants.reduce((sum, v) => sum + (v.quantity || 0), 0);
  }
  this.isLowStock = this.stock < 5;

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

productSchema.index({ 'name.ar': 'text', 'name.en': 'text', 'category.ar': 'text', 'category.en': 'text' });
productSchema.index({ sellingPrice: 1 });
productSchema.index({ averageRating: -1 });
productSchema.index({ sold: -1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isLowStock: 1 });

module.exports = mongoose.model('Product', productSchema);
