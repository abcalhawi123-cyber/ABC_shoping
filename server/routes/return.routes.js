const express = require('express');
const router = express.Router();
const Return = require('../models/Return');
const Order = require('../models/Order');
const Product = require('../models/Product'); // FIX Bug 4: needed for restock
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/returns — user submits per-item return
router.post('/', protect, async (req, res, next) => {
  try {
    // FIX Bug 4: accept productId and selectedColor
    const { orderId, productId, productName, productImage, selectedColor, quantity, reason } = req.body;

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, message: 'سبب الإرجاع مطلوب' });
    }

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    if (order.user && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'غير مصرح' });
    }

    if (order.status !== 'تم التسليم') {
      return res.status(400).json({ success: false, message: 'يمكن الإرجاع فقط بعد تسليم الطلب' });
    }

    // 15-day window check
    const days15 = 15 * 24 * 60 * 60 * 1000;
    if (Date.now() - new Date(order.createdAt).getTime() > days15) {
      return res.status(400).json({ success: false, message: 'انتهت مدة الإرجاع (15 يوم)' });
    }

    // Prevent duplicate return for same product/color in same order
    const existing = await Return.findOne({
      order: orderId,
      product: productId,
      selectedColor: selectedColor || null,
      status: { $in: ['pending', 'approved'] },
    });
    if (existing) {
      return res.status(400).json({ success: false, message: 'تم تقديم طلب إرجاع لهذا المنتج بالفعل' });
    }

    const ret = await Return.create({
      order: orderId,
      user: req.user._id,
      product: productId || null,
      productName,
      productImage,
      selectedColor: selectedColor || null,
      quantity: quantity || 1,
      customerName: req.user.name,
      customerPhone: req.user.phone || order.customer.phone,
      customerEmail: req.user.email,
      reason: reason.trim(),
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

// PATCH /api/returns/:id — admin updates status + restocks on approval
router.patch('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { status, adminNote } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'حالة غير صالحة' });
    }

    const ret = await Return.findById(req.params.id);
    if (!ret) return res.status(404).json({ success: false, message: 'Return not found' });

    // FIX Bug 4: Restock on approval — only once, respecting color variants
    if (status === 'approved' && !ret.stockRestored && ret.product) {
      const product = await Product.findById(ret.product);
      if (product) {
        if (product.colorVariants?.length > 0 && ret.selectedColor) {
          const variant = product.colorVariants.find(v => v.color === ret.selectedColor);
          if (variant) {
            variant.quantity += ret.quantity;
          } else {
            // Color variant deleted since purchase — fallback to flat stock
            product.stock += ret.quantity;
          }
        } else {
          product.stock += ret.quantity;
        }
        product.sold = Math.max(0, (product.sold || 0) - ret.quantity);
        await product.save(); // triggers pre-save to recompute total stock
        ret.stockRestored = true;
      }
    }

    ret.status = status;
    if (adminNote !== undefined) ret.adminNote = adminNote;
    ret.resolvedAt = status !== 'pending' ? new Date() : ret.resolvedAt;
    await ret.save();

    res.json({ success: true, data: ret });
  } catch (e) { next(e); }
});

module.exports = router;
