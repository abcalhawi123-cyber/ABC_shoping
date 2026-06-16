const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect, adminOnly } = require('../middleware/auth');

// ── GET /api/reviews/:productId — 4 initial, load more ────
router.get('/:productId', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 4; // Always 4 per page
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ product: req.params.productId, isApproved: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'name'),
      Review.countDocuments({ product: req.params.productId, isApproved: true }),
    ]);

    res.json({
      success: true,
      data: reviews,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (e) {
    next(e);
  }
});

// ── POST /api/reviews/:productId — submit review ──────────
router.post('/:productId', async (req, res, next) => {
  try {
    const { rating, comment, guestName, userId } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    }

    const reviewData = {
      product: req.params.productId,
      rating: Number(rating),
      comment,
    };

    if (userId) {
      reviewData.user = userId;
    } else {
      reviewData.guestName = guestName || 'زائر';
    }

    const review = await Review.create(reviewData);
    res.status(201).json({
      success: true,
      message: 'Review submitted, pending approval',
      data: review,
    });
  } catch (e) {
    next(e);
  }
});

// ── GET /api/reviews/pending — admin: unapproved reviews ──
router.get('/admin/pending', protect, adminOnly, async (req, res, next) => {
  try {
    const reviews = await Review.find({ isApproved: false })
      .sort({ createdAt: -1 })
      .populate('product', 'name')
      .populate('user', 'name email');
    res.json({ success: true, data: reviews });
  } catch (e) {
    next(e);
  }
});

// ── PATCH /api/reviews/:id/approve — admin approve ────────
router.patch('/:id/approve', protect, adminOnly, async (req, res, next) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    res.json({ success: true, data: review });
  } catch (e) {
    next(e);
  }
});

// ── DELETE /api/reviews/:id — admin delete ────────────────
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
