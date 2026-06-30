const express = require('express');
const router = express.Router();
const Return = require('../models/Return');
const Order = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/returns — user submits per-item return
router.post('/', protect, async (req, res, next) => {
  try {
    const { orderId, productName, productImage, quantity, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // 15-day window check
    const days15 = 15 * 24 * 60 * 60 * 1000;
    if (Date.now() - new Date(order.createdAt).getTime() > days15) {
      return res.status(400).json({ success: false, message: 'انتهت مدة الإرجاع (15 يوم)' });
    }

    const ret = await Return.create({
      order: orderId,
      user: req.user._id,
      productName,
      productImage,
      quantity: quantity || 1,
      customerName: req.user.name,
      customerPhone: req.user.phone || order.customer.phone,
      customerEmail: req.user.email,
      reason,
    });

    res.status(201).json({ success: true, data: ret });
  } catch (e) { next(e); }
});

// GET /api/returns — admin: all returns
router.get('/', protect, adminOnly, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 20;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [returns, total] = await Promise.all([
      Return.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Return.countDocuments(filter),
    ]);

    res.json({ success: true, data: returns, pagination: { total, page, pages: Math.ceil(total / limit) } });
  } catch (e) { next(e); }
});

// PATCH /api/returns/:id — admin updates status
router.patch('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    const ret = await Return.findByIdAndUpdate(
      req.params.id,
      { status, adminNote, resolvedAt: status !== 'pending' ? new Date() : undefined },
      { new: true }
    );
    if (!ret) return res.status(404).json({ success: false, message: 'Return not found' });
    res.json({ success: true, data: ret });
  } catch (e) { next(e); }
});

module.exports = router;
