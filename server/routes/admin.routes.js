const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

router.use(protect, adminOnly);

// ── Dashboard ─────────────────────────────────────────────
router.get('/dashboard', async (req, res, next) => {
  try {
    const [totalOrders, pendingInstapay, lowStockProducts, recentOrders, salesStats, topProducts, slowProducts] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ paymentMethod: 'instapay', paymentStatus: 'pending' }),
      Product.find({ isLowStock: true, isActive: true }).select('name stock images'),
      Order.find().sort({ createdAt: -1 }).limit(10).select('customer total status paymentMethod createdAt'),
      Order.aggregate([{ $group: { _id: null, totalRevenue: { $sum: '$total' }, totalShipping: { $sum: '$shippingFee' }, orderCount: { $sum: 1 }, avgOrder: { $avg: '$total' } } }]),
      Product.find({ isActive: true }).sort({ sold: -1 }).limit(5).select('name sold sellingPrice costPrice images'),
      Product.find({ isActive: true, sold: 0 }).limit(5).select('name sold stock createdAt'),
    ]);

    const profitStats = await Order.aggregate([
      { $match: { status: 'تم التسليم' } },
      { $unwind: '$items' },
      { $group: { _id: null, totalProfit: { $sum: { $multiply: [{ $subtract: ['$items.unitPrice', '$items.costPrice'] }, '$items.quantity'] } }, totalCost: { $sum: { $multiply: ['$items.costPrice', '$items.quantity'] } } } },
    ]);

    res.json({ success: true, data: { totalOrders, pendingInstapayApprovals: pendingInstapay, lowStockCount: lowStockProducts.length, lowStockProducts, recentOrders, salesStats: salesStats[0] || {}, profitStats: profitStats[0] || {}, topProducts, slowProducts } });
  } catch (e) { next(e); }
});

// ── Orders — with FIXED search by name or phone ───────────
router.get('/orders', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

    // FIXED: search by customer name OR phone using regex
    if (req.query.search && req.query.search.trim()) {
      const term = req.query.search.trim();
      filter.$or = [
        { 'customer.name': { $regex: term, $options: 'i' } },
        { 'customer.phone': { $regex: term, $options: 'i' } },
        { 'customer.email': { $regex: term, $options: 'i' } },
      ];
    }

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
    ]);

    res.json({ success: true, data: orders, pagination: { total, page, pages: Math.ceil(total / limit), limit } });
  } catch (e) { next(e); }
});

// ── Products ──────────────────────────────────────────────
router.get('/products', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 20;
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.lowStock === 'true') filter.isLowStock = true;
    if (req.query.category) { filter.$or = [{ 'category.ar': req.query.category }, { 'category.en': req.query.category }]; }

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);
    res.json({ success: true, data: products, pagination: { total, page, pages: Math.ceil(total / limit) } });
  } catch (e) { next(e); }
});

// ── Export ────────────────────────────────────────────────
router.get('/reports/export', async (req, res, next) => {
  try {
    const { format = 'excel', startDate, endDate } = req.query;
    const matchStage = {};
    if (startDate) matchStage.createdAt = { ...matchStage.createdAt, $gte: new Date(startDate) };
    if (endDate) matchStage.createdAt = { ...matchStage.createdAt, $lte: new Date(endDate) };
    const orders = await Order.find(matchStage).sort({ createdAt: -1 });

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Sales Report');
      sheet.columns = [
        { header: 'Order ID', key: 'id', width: 28 }, { header: 'Customer', key: 'customer', width: 20 },
        { header: 'Phone', key: 'phone', width: 16 }, { header: 'Status', key: 'status', width: 16 },
        { header: 'Payment', key: 'payment', width: 12 }, { header: 'Total', key: 'total', width: 12 },
        { header: 'Profit', key: 'profit', width: 12 }, { header: 'Date', key: 'date', width: 18 },
      ];
      sheet.getRow(1).font = { bold: true };
      orders.forEach(order => {
        const profit = order.items.reduce((s, i) => s + (i.unitPrice - i.costPrice) * i.quantity, 0);
        sheet.addRow({ id: order._id.toString(), customer: order.customer.name, phone: order.customer.phone, status: order.status, payment: order.paymentMethod, total: order.total.toFixed(2), profit: profit.toFixed(2), date: new Date(order.createdAt).toLocaleDateString() });
      });
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=stock-report.xlsx');
      await workbook.xlsx.write(res);
      res.end();
    } else {
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=stock-report.pdf');
      doc.pipe(res);
      doc.fontSize(20).text('stock — Sales Report', { align: 'center' });
      doc.moveDown();
      let totalRevenue = 0, totalProfit = 0;
      orders.forEach((order, i) => {
        const profit = order.items.reduce((s, item) => s + (item.unitPrice - item.costPrice) * item.quantity, 0);
        totalRevenue += order.total; totalProfit += profit;
        doc.fontSize(11).text(`${i + 1}. ${order.customer.name} | ${order.status} | ${order.total.toFixed(2)} EGP | Profit: ${profit.toFixed(2)} EGP`);
      });
      doc.moveDown();
      doc.fontSize(14).text(`Total Revenue: ${totalRevenue.toFixed(2)} EGP   Net Profit: ${totalProfit.toFixed(2)} EGP`);
      doc.end();
    }
  } catch (e) { next(e); }
});

module.exports = router;
