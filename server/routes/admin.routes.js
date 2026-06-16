const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

// All admin routes require auth + admin role
router.use(protect, adminOnly);

// ── GET /api/[admin-prefix]/dashboard ────────────────────
router.get('/dashboard', async (req, res, next) => {
  try {
    const [
      totalOrders,
      pendingInstapay,
      lowStockProducts,
      recentOrders,
      salesStats,
      topProducts,
      slowProducts,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ paymentMethod: 'instapay', paymentStatus: 'pending' }),
      Product.find({ isLowStock: true, isActive: true }).select('name stock images'),
      Order.find().sort({ createdAt: -1 }).limit(10).select('customer total status paymentMethod createdAt'),
      Order.aggregate([
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$total' },
            totalShipping: { $sum: '$shippingFee' },
            orderCount: { $sum: 1 },
            avgOrder: { $avg: '$total' },
          },
        },
      ]),
      // Best-selling products
      Product.find({ isActive: true }).sort({ sold: -1 }).limit(5).select('name sold sellingPrice costPrice images'),
      // Slow-moving (active but zero sales)
      Product.find({ isActive: true, sold: 0 }).limit(5).select('name sold stock createdAt'),
    ]);

    // Calculate total profit from delivered orders
    const profitStats = await Order.aggregate([
      { $match: { status: 'تم التسليم' } },
      { $unwind: '$items' },
      {
        $group: {
          _id: null,
          totalProfit: {
            $sum: { $multiply: [{ $subtract: ['$items.unitPrice', '$items.costPrice'] }, '$items.quantity'] },
          },
          totalCost: { $sum: { $multiply: ['$items.costPrice', '$items.quantity'] } },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingInstapayApprovals: pendingInstapay,
        lowStockCount: lowStockProducts.length,
        lowStockProducts,
        recentOrders,
        salesStats: salesStats[0] || {},
        profitStats: profitStats[0] || {},
        topProducts,
        slowProducts,
      },
    });
  } catch (e) {
    next(e);
  }
});

// ── GET /api/[admin-prefix]/orders — all orders, paginated ─
router.get('/orders', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.paymentMethod) filter.paymentMethod = req.query.paymentMethod;
    if (req.query.paymentStatus) filter.paymentStatus = req.query.paymentStatus;

    const [orders, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(filter),
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

// ── GET /api/[admin-prefix]/products — all products (with cost) ─
router.get('/products', async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.lowStock === 'true') filter.isLowStock = true;
    if (req.query.category) {
      filter.$or = [
        { 'category.ar': req.query.category },
        { 'category.en': req.query.category },
      ];
    }

    const [products, total] = await Promise.all([
      Product.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: products,
      pagination: { total, page, pages: Math.ceil(total / limit) },
    });
  } catch (e) {
    next(e);
  }
});

// ── GET /api/[admin-prefix]/reports/export?format=excel|pdf ─
router.get('/reports/export', async (req, res, next) => {
  try {
    const { format = 'excel', startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const matchStage = {};
    if (startDate || endDate) matchStage.createdAt = dateFilter;

    const orders = await Order.find(matchStage)
      .sort({ createdAt: -1 })
      .populate('items.product', 'name');

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Sales Report');

      sheet.columns = [
        { header: 'Order ID', key: 'id', width: 28 },
        { header: 'Customer', key: 'customer', width: 20 },
        { header: 'Email', key: 'email', width: 28 },
        { header: 'Status', key: 'status', width: 16 },
        { header: 'Payment', key: 'payment', width: 12 },
        { header: 'Subtotal', key: 'subtotal', width: 12 },
        { header: 'Shipping', key: 'shipping', width: 10 },
        { header: 'Total', key: 'total', width: 12 },
        { header: 'Profit', key: 'profit', width: 12 },
        { header: 'Date', key: 'date', width: 18 },
      ];

      // Style header row
      sheet.getRow(1).font = { bold: true };
      sheet.getRow(1).fill = {
        type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2C3E50' },
      };
      sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

      orders.forEach((order) => {
        const profit = order.items.reduce(
          (sum, item) => sum + (item.unitPrice - item.costPrice) * item.quantity, 0
        );
        sheet.addRow({
          id: order._id.toString(),
          customer: order.customer.name,
          email: order.customer.email,
          status: order.status,
          payment: order.paymentMethod,
          subtotal: order.subtotal.toFixed(2),
          shipping: order.shippingFee.toFixed(2),
          total: order.total.toFixed(2),
          profit: profit.toFixed(2),
          date: new Date(order.createdAt).toLocaleDateString('ar-EG'),
        });
      });

      // Low stock sheet
      const stockSheet = workbook.addWorksheet('Low Stock');
      stockSheet.columns = [
        { header: 'Product (AR)', key: 'nameAr', width: 30 },
        { header: 'Product (EN)', key: 'nameEn', width: 30 },
        { header: 'Stock', key: 'stock', width: 10 },
        { header: 'Category', key: 'category', width: 20 },
      ];
      const lowStock = await Product.find({ isLowStock: true });
      lowStock.forEach((p) => {
        stockSheet.addRow({
          nameAr: p.name.ar,
          nameEn: p.name.en,
          stock: p.stock,
          category: p.category.ar,
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=abc-alhawi-report.xlsx');
      await workbook.xlsx.write(res);
      res.end();

    } else if (format === 'pdf') {
      const doc = new PDFDocument({ margin: 50 });
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=abc-alhawi-report.pdf');
      doc.pipe(res);

      doc.fontSize(20).text('ABC Al-Hawi — Sales Report', { align: 'center' });
      doc.moveDown();

      let totalRevenue = 0, totalProfit = 0;
      orders.forEach((order, i) => {
        const profit = order.items.reduce(
          (sum, item) => sum + (item.unitPrice - item.costPrice) * item.quantity, 0
        );
        totalRevenue += order.total;
        totalProfit += profit;
        doc.fontSize(11).text(
          `${i + 1}. ${order.customer.name} | ${order.status} | ${order.total.toFixed(2)} EGP | Profit: ${profit.toFixed(2)} EGP | ${new Date(order.createdAt).toLocaleDateString()}`
        );
      });

      doc.moveDown();
      doc.fontSize(14).text(`Total Revenue: ${totalRevenue.toFixed(2)} EGP`, { continued: true });
      doc.text(`   Net Profit: ${totalProfit.toFixed(2)} EGP`);
      doc.end();
    } else {
      res.status(400).json({ success: false, message: 'Format must be excel or pdf' });
    }
  } catch (e) {
    next(e);
  }
});

module.exports = router;
