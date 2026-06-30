const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/categories — public
router.get('/', async (req, res, next) => {
  try {
    const cats = await Category.find({ isActive: true }).sort({ createdAt: 1 });
    res.json({ success: true, data: cats });
  } catch (e) { next(e); }
});

// POST /api/categories — admin
router.post('/', protect, adminOnly, async (req, res, next) => {
  try {
    const { nameAr, nameEn } = req.body;
    if (!nameAr || !nameEn) return res.status(400).json({ success: false, message: 'Both Arabic and English names required' });
    const cat = await Category.create({ name: { ar: nameAr, en: nameEn } });
    res.status(201).json({ success: true, data: cat });
  } catch (e) { next(e); }
});

// PATCH /api/categories/:id — admin
router.patch('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const { nameAr, nameEn, isActive } = req.body;
    const update = {};
    if (nameAr) update['name.ar'] = nameAr;
    if (nameEn) update['name.en'] = nameEn;
    if (isActive !== undefined) update.isActive = isActive;
    const cat = await Category.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!cat) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: cat });
  } catch (e) { next(e); }
});

// DELETE /api/categories/:id — admin
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
