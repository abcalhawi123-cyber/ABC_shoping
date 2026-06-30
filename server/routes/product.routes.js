const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { protect, adminOnly } = require('../middleware/auth');
const { uploadProduct } = require('../config/cloudinary');
const { cloudinary } = require('../config/cloudinary');

// GET /api/products
router.get('/', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(20, parseInt(req.query.limit) || 20);
    const skip = (page - 1) * limit;
    const filter = { isActive: true };
    if (req.query.q) filter.$text = { $search: req.query.q };
    if (req.query.category) filter.$or = [{ 'category.ar': req.query.category }, { 'category.en': req.query.category }];
    if (req.query.minPrice || req.query.maxPrice) { filter.sellingPrice = {}; if (req.query.minPrice) filter.sellingPrice.$gte = Number(req.query.minPrice); if (req.query.maxPrice) filter.sellingPrice.$lte = Number(req.query.maxPrice); }
    const sortMap = { newest: { createdAt: -1 }, price_asc: { sellingPrice: 1 }, price_desc: { sellingPrice: -1 }, rating: { averageRating: -1 }, popular: { sold: -1 } };
    const sort = sortMap[req.query.sort] || { createdAt: -1 };
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit).select('-costPrice'),
      Product.countDocuments(filter),
    ]);
    res.json({ success: true, data: products, pagination: { total, page, pages: Math.ceil(total / limit), limit } });
  } catch (e) { next(e); }
});

// GET /api/products/:slug
router.get('/:slug', async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).select('-costPrice');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (e) { next(e); }
});

// POST /api/products — admin create
router.post('/', protect, adminOnly, uploadProduct.array('images', 5), async (req, res, next) => {
  try {
    const { nameAr, nameEn, categoryAr, categoryEn, descriptionAr, descriptionEn, costPrice, sellingPrice, discount, metaTitle, metaDescription } = req.body;
    // Parse colorVariants from JSON string
    let colorVariants = [];
    if (req.body.colorVariants) {
      try { colorVariants = JSON.parse(req.body.colorVariants); } catch {}
    }
    const images = req.files?.map(f => ({ url: f.path, publicId: f.filename })) || [];
    const product = await Product.create({
      name: { ar: nameAr, en: nameEn },
      category: { ar: categoryAr, en: categoryEn },
      description: { ar: descriptionAr || '', en: descriptionEn || '' },
      costPrice: Number(costPrice),
      sellingPrice: Number(sellingPrice),
      discount: Number(discount) || 0,
      colorVariants,
      images,
      metaTitle,
      metaDescription,
    });
    res.status(201).json({ success: true, data: product });
  } catch (e) { next(e); }
});

// PATCH /api/products/:id — admin update
router.patch('/:id', protect, adminOnly, uploadProduct.array('images', 5), async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    ['costPrice', 'sellingPrice', 'discount', 'isActive', 'metaTitle', 'metaDescription'].forEach(f => { if (req.body[f] !== undefined) product[f] = req.body[f]; });
    if (req.body.nameAr) product.name.ar = req.body.nameAr;
    if (req.body.nameEn) product.name.en = req.body.nameEn;
    if (req.body.categoryAr) product.category.ar = req.body.categoryAr;
    if (req.body.categoryEn) product.category.en = req.body.categoryEn;
    if (req.body.descriptionAr) product.description.ar = req.body.descriptionAr;
    if (req.body.descriptionEn) product.description.en = req.body.descriptionEn;
    if (req.body.colorVariants) {
      try { product.colorVariants = JSON.parse(req.body.colorVariants); } catch {}
    }
    if (req.files?.length) {
      const newImages = req.files.map(f => ({ url: f.path, publicId: f.filename }));
      product.images.push(...newImages);
    }
    await product.save();
    res.json({ success: true, data: product });
  } catch (e) { next(e); }
});

// DELETE /api/products/:id
router.delete('/:id', protect, adminOnly, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    await Promise.all(product.images.map(img => img.publicId ? cloudinary.uploader.destroy(img.publicId) : null));
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (e) { next(e); }
});

module.exports = router;
