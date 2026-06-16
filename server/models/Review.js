const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // allow guest reviews
    },
    guestName: String,
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    isApproved: {
      type: Boolean,
      default: false, // Admin must approve before public display
    },
  },
  { timestamps: true }
);

// One review per user per product (prevent spam)
reviewSchema.index({ product: 1, user: 1 }, { unique: true, sparse: true });

// Recalculate product averageRating after save/delete
async function updateProductRating(productId) {
  const Product = mongoose.model('Product');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { product: productId, isApproved: true } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);
  if (stats.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      averageRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].count,
    });
  } else {
    await Product.findByIdAndUpdate(productId, { averageRating: 0, reviewCount: 0 });
  }
}

reviewSchema.post('save', function () {
  updateProductRating(this.product);
});

reviewSchema.post('remove', function () {
  updateProductRating(this.product);
});

module.exports = mongoose.model('Review', reviewSchema);
