const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const ShippingZone = require('../models/ShippingZone');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadPayment } = require('../config/cloudinary');

const COD_FEE = 12; // Extra fee for Cash on Delivery, in EGP

// ── POST /api/orders — place order (guest or logged-in) ───
router.post('/', uploadPayment.single('instapayScreenshot'), async (req, res, next) => {
  try {
    const {
      customerName, customerEmail, customerPhone,
      governorate, city, street, building,
      items, // JSON string: [{productId, quantity, selectedColor}]
      paymentMethod, // 'cod' | 'instapay' — Paymob/card removed
      instapayTransactionId,
      userId,
    } = req.body;

    if (!['cod', 'instapay'].includes(paymentMethod)) {
      return res.status(400).json({ success: false, message: 'طريقة الدفع غير صالحة' });
    }

    const parsedItems = JSON.parse(items);
    if (!parsedItems?.length) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item' });
    }

    let subtotal = 0;
    const orderItems = [];

    for (const { productId, quantity, selectedColor } of parsedItems) {
      const product = await Product.findById(productId);
      if (!product || !product.isActive) {
        return res.status(400).json({ success: false, message: `Product ${productId} not found` });
      }

      if (product.colorVariants && product.colorVariants.length > 0) {
        if (!selectedColor) {
          return res.status(400).json({ success: false, message: `يجب اختيار اللون لمنتج ${product.name.ar}` });
        }
        const variant = product.colorVariants.find(v => v.color === selectedColor);
        if (!variant) {
          return res.status(400).json({ success: false, message: `اللون "${selectedColor}" غير متوفر لهذا المنتج` });
        }
        if (variant.quantity < quantity) {
          return res.status(400).json({
            success: false,
            message: `الكمية المتاحة من ${product.name.ar} (${selectedColor}) هي ${variant.quantity} فقط`,
          });
        }
      } else if (product.stock < quantity) {
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
        selectedColor: selectedColor || null,
        quantity,
        unitPrice,
        costPrice: product.costPrice,
        discount: product.discount,
      });
    }

    const zone = await ShippingZone.findOne({
      $or: [{ 'governorate.ar': governorate }, { 'governorate.en': governorate }],
      isActive: true,
    });
    if (!zone) {
      return res.status(400).json({ success: false, message: 'Shipping zone not found' });
    }

    // Deduct stock — from specific color variant when applicable
    for (const { productId, quantity, selectedColor } of parsedItems) {
      const product = await Product.findById(productId);
      if (product.colorVariants && product.colorVariants.length > 0 && selectedColor) {
        const variant = product.colorVariants.find(v => v.color === selectedColor);
        if (variant) variant.quantity -= quantity;
        product.sold = (product.sold || 0) + quantity;
        await product.save();
      } else {
        await Product.findByIdAndUpdate(productId, { $inc: { stock: -quantity, sold: quantity } });
      }
    }

    const codFee = paymentMethod === 'cod' ? COD_FEE : 0;

    const orderData = {
      customer: { name: customerName, email: customerEmail, phone: customerPhone },
      items: orderItems,
      shippingAddress: {
        governorate: { ar: zone.governorate.ar, en: zone.governorate.en },
        city, street, building,
      },
      shippingFee: zone.price,
      estimatedDeliveryDays: zone.estimatedDays,
      subtotal,
      codFee,
      total: subtotal + zone.price + codFee,
      paymentMethod,
      paymentStatus: 'pending',
      isGuestOrder: !userId,
    };

    if (userId) orderData.user = userId;

    if (paymentMethod === 'instapay') {
      if (!instapayTransactionId) {
        return res.status(400).json({ success: false, message: 'Transaction ID required for InstaPay' });
      }
      orderData.instapayTransactionId = instapayTransactionId;
      if (req.file) {
        orderData.instapayScreenshotUrl = req.file.path;
        orderData.instapayScreenshotPublicId = req.file.filename;
      }
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
        .select('status paymentStatus paymentMethod total subtotal shippingFee codFee createdAt items shippingAddress isReturnEligible refundAmount'),
      Order.countDocuments({ user: req.user._id }),
    ]);

    // Auto-expire the 15-day return window server-side, so the flag
    // is always accurate regardless of when the client last checked.
    const days15 = 15 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const withExpiry = orders.map(o => {
      const obj = o.toObject();
      if (obj.isReturnEligible && now - new Date(obj.createdAt).getTime() > days15) {
        obj.isReturnEligible = false;
      }
      return obj;
    });

    res.json({
      success: true,
      data: withExpiry,
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

    order.status = status;
    if (note) order.notes = note;
    await order.save();

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
