const express = require('express');
const router = express.Router();
const ShippingZone = require('../models/ShippingZone');
const { protect, adminOnly } = require('../middleware/auth');

// ── GET /api/shipping — public: all active zones ──────────
router.get('/', async (req, res, next) => {
  try {
    const zones = await ShippingZone.find({ isActive: true }).sort({ 'governorate.ar': 1 });
    res.json({ success: true, data: zones });
  } catch (e) {
    next(e);
  }
});

// ── POST /api/shipping — admin add zone ───────────────────
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { governorateAr, governorateEn, price, minDays, maxDays } = req.body;
    const zone = await ShippingZone.create({
      governorate: { ar: governorateAr, en: governorateEn },
      price: Number(price),
      estimatedDays: { min: Number(minDays), max: Number(maxDays) },
    });
    res.status(201).json({ success: true, data: zone });
  } catch (e) {
    next(e);
  }
});

// ── PATCH /api/shipping/:id — admin update ────────────────
router.patch('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { governorateAr, governorateEn, price, minDays, maxDays, isActive } = req.body;
    const update = {};
    if (governorateAr) update['governorate.ar'] = governorateAr;
    if (governorateEn) update['governorate.en'] = governorateEn;
    if (price !== undefined) update.price = Number(price);
    if (minDays !== undefined) update['estimatedDays.min'] = Number(minDays);
    if (maxDays !== undefined) update['estimatedDays.max'] = Number(maxDays);
    if (isActive !== undefined) update.isActive = isActive;

    const zone = await ShippingZone.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!zone) return res.status(404).json({ success: false, message: 'Zone not found' });
    res.json({ success: true, data: zone });
  } catch (e) {
    next(e);
  }
});

// ── DELETE /api/shipping/:id ──────────────────────────────
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    await ShippingZone.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Zone deleted' });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
