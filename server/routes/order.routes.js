const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const ShippingZone = require('../models/ShippingZone');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadPayment } = require('../config/cloudinary');

// ── POST /api/orders — place order (guest or logged-in) ───
router.post('/', uploadPayment.single('instapayScreenshot'), async (req, res, next) => {
  try {
    const {
      customerName, customerEmail, customerPhone,
      governorate, city, street, building,
      items, // JSON string: [{productId, quantity}]
      paymentMethod,
      instapayTransactionId,
      userId, // optional — if user is logged in
    } = req.body;

    // Parse items
    const parsedItems = JSON.parse(items);
    if (!parsedItems?.length) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item' });
    }

    // Validate products and build order items
    let subtotal = 0;
    const orderItems = [];

    for (const { productId, quantity } of parsedItems) {
      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        return res.status(400).json({ success: false, message: `Product ${productId} not found` });
      }
      if (product.stock < quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name.ar}`,
        });
      }
      const unitPrice = product.sellingPrice * (1 - product.discount / 100);
      subtotal += unitPrice * quantity;
      orderItems.push({
        product: product._id,
        name: product.name,
        image: product.images[0]?.url,
        quantity,
        unitPrice,
        costPrice: product.costPrice,
        discount: product.discount,
      });
    }

    // Get shipping fee
    const zone = await ShippingZone.findOne({
      $or: [{ 'governorate.ar': governorate }, { 'governorate.en': governorate }],
      isActive: true,
    });
    if (!zone) {
      return res.status(400).json({ success: false, message: 'Shipping zone not found' });
    }

    // Deduct stock
    for (const { productId, quantity } of parsedItems) {
      await Product.findByIdAndUpdate(productId, {
        $inc: { stock: -quantity, sold: quantity },
      });
    }

    // Build order
    const orderData = {
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      items: orderItems,
      shippingAddress: {
        governorate: { ar: zone.governorate.ar, en: zone.governorate.en },
        city,
        street,
        building,
      },
      shippingFee: zone.price,
      estimatedDeliveryDays: zone.estimatedDays,
      subtotal,
      total: subtotal + zone.price,
      paymentMethod,
      isGuestOrder: !userId,
    };

    if (userId) orderData.user = userId;

    // InstaPay fields
    if (paymentMethod === 'instapay') {
      if (!instapayTransactionId) {
        return res.status(400).json({ success: false, message: 'Transaction ID required for InstaPay' });
      }
      orderData.instapayTransactionId = instapayTransactionId;
      if (req.file) {
        orderData.instapayScreenshotUrl = req.file.path;
        orderData.instapayScreenshotPublicId = req.file.filename;
      }
      orderData.paymentStatus = 'pending'; // Awaits admin approval
    }

    if (paymentMethod === 'cod') {
      orderData.paymentStatus = 'pending';
    }

    const order = await Order.create(orderData);

    res.status(201).json({
      success: true,
      data: {
        orderId: order._id,
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
      },
    });
  } catch (e) {
    next(e);
  }
});

// ── GET /api/orders/:id — track order ─────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .select('-instapayScreenshotPublicId')
      .populate('items.product', 'name images slug');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (e) {
    next(e);
  }
});

// ── GET /api/orders/my/orders — user's own orders ─────────
router.get('/my/orders', protect, async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 10;
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('status paymentStatus total createdAt items shippingAddress'),
      Order.countDocuments({ user: req.user._id }),
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (e) {
    next(e);
  }
});

// ── PATCH /api/orders/:id/status — admin update status ────
router.patch('/:id/status', protect, adminOnly, async (req, res, next) => {
  try {
    const { status, note } = req.body;
    const validStatuses = ['قيد المراجعة', 'جاري التجهيز', 'تم الشحن', 'تم التسليم', 'مرتجع'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Check return eligibility
    if (status === 'مرتجع' && !order.canReturn) {
      return res.status(400).json({ success: false, message: 'Return window (15 days) has expired' });
    }

    order.status = status;
    if (note) order.notes = note;
    await order.save(); // Pre-save hook handles auto-restock

    res.json({ success: true, data: order });
  } catch (e) {
    next(e);
  }
});

// ── PATCH /api/orders/:id/payment — admin approve instapay ─
router.patch('/:id/payment', protect, adminOnly, async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true, runValidators: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
