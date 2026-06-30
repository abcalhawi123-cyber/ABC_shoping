import { createContext, useContext, useState, useEffect } from 'react';

const LangContext = createContext();

// BRAND: "stock" never translates
const BRAND = 'stock';

const T = {
  ar: {
    brand: BRAND,
    home: 'الرئيسية', products: 'المنتجات', categories: 'الأصناف',
    cart: 'السلة', myOrders: 'طلباتي', login: 'تسجيل الدخول',
    register: 'إنشاء حساب', logout: 'تسجيل الخروج', search: 'ابحث عن منتج...',
    addToCart: 'أضف للسلة', outOfStock: 'غير متوفر', onlyLeft: 'قطع فقط!',
    reviews: 'التقييمات', noReviews: 'لا توجد تقييمات بعد',
    loadMoreReviews: 'تحميل المزيد', writeReview: 'اكتب تقييمك', submitReview: 'إرسال التقييم',
    cartEmpty: 'السلة فارغة', cartSummary: 'ملخص السلة', subtotal: 'المجموع الفرعي',
    shippingFee: 'رسوم الشحن', shippingCalcAtCheckout: 'تُحسب عند الدفع',
    total: 'الإجمالي', checkout: 'إتمام الشراء', continueShopping: 'متابعة التسوق',
    shippingNote: '* رسوم الشحن تُضاف في صفحة الدفع', shopNow: 'تسوق الآن',
    yourName: 'الاسم الكامل', yourEmail: 'البريد الإلكتروني', yourPhone: 'رقم الهاتف',
    governorate: 'المحافظة', selectGovernorate: 'اختر المحافظة',
    city: 'المدينة', street: 'الشارع', building: 'رقم المبنى (اختياري)',
    paymentMethod: 'طريقة الدفع', cod: 'الدفع عند الاستلام', instapay: 'InstaPay',
    card: 'بطاقة ائتمانية', transactionId: 'كود العملية',
    uploadScreenshot: 'رفع صورة التحويل', placeOrder: 'تأكيد الطلب',
    contactInfo: 'بيانات التواصل', shippingAddress: 'عنوان الشحن', orderSummary: 'ملخص الطلب',
    returnPolicy: 'سياسة الإرجاع: 15 يوم من تاريخ الطلب',
    orderDate: 'تاريخ الطلب', orderTotal: 'إجمالي الطلب', orderStatus: 'حالة الطلب',
    trackOrder: 'تتبع الطلب',
    returnBtn: 'إرجاع', returnRequested: 'تم طلب الإرجاع',
    returnEligible: 'الإرجاع متاح حتى', returnExpired: 'انتهت مدة الإرجاع',
    returnReason: 'سبب الإرجاع', submitReturn: 'إرسال طلب الإرجاع',
    selectColor: 'اختر اللون', availableQty: 'الكمية المتوفرة',
    noOrders: 'لا توجد طلبات بعد', loginFirst: 'يجب تسجيل الدخول أولاً', loading: 'جاري التحميل...',
    followUs: 'تابعنا', contactUs: 'تواصل معنا', storePolicies: 'سياسات المتجر',
    returnPolicy15: 'سياسة الإرجاع: 15 يوم', shippingAllGov: 'شحن لجميع محافظات مصر',
    rights: `جميع الحقوق محفوظة © ${BRAND}`,
    dashboard: 'لوحة التحكم', addProduct: 'إضافة منتج', lowStock: 'مخزون منخفض',
    approve: 'موافقة', reject: 'رفض', delete: 'حذف', edit: 'تعديل', save: 'حفظ', cancel: 'إلغاء',
    netProfit: 'الربح الصافي', totalRevenue: 'إجمالي الإيرادات',
    adminCategories: 'الأصناف', adminReturns: 'المرتجعات',
    colorVariants: 'الألوان والكميات', addColor: 'إضافة لون', color: 'اللون', quantity: 'الكمية',
  },
  en: {
    brand: BRAND,
    home: 'Home', products: 'Products', categories: 'Category',
    cart: 'Cart', myOrders: 'My Orders', login: 'Login',
    register: 'Register', logout: 'Logout', search: 'Search products...',
    addToCart: 'Add to Cart', outOfStock: 'Out of Stock', onlyLeft: 'only left!',
    reviews: 'Reviews', noReviews: 'No reviews yet',
    loadMoreReviews: 'Load More', writeReview: 'Write a Review', submitReview: 'Submit Review',
    cartEmpty: 'Your cart is empty', cartSummary: 'Cart Summary', subtotal: 'Subtotal',
    shippingFee: 'Shipping Fee', shippingCalcAtCheckout: 'calculated at checkout',
    total: 'Total', checkout: 'Checkout', continueShopping: 'Continue Shopping',
    shippingNote: '* Shipping fee added at checkout', shopNow: 'Shop Now',
    yourName: 'Full Name', yourEmail: 'Email', yourPhone: 'Phone Number',
    governorate: 'Governorate', selectGovernorate: 'Select Governorate',
    city: 'City', street: 'Street', building: 'Building No. (optional)',
    paymentMethod: 'Payment Method', cod: 'Cash on Delivery', instapay: 'InstaPay',
    card: 'Credit / Debit Card', transactionId: 'Transaction ID',
    uploadScreenshot: 'Upload Transfer Screenshot', placeOrder: 'Place Order',
    contactInfo: 'Contact Info', shippingAddress: 'Shipping Address', orderSummary: 'Order Summary',
    returnPolicy: 'Return Policy: 15 days from order date',
    orderDate: 'Order Date', orderTotal: 'Order Total', orderStatus: 'Order Status',
    trackOrder: 'Track Order',
    returnBtn: 'Return', returnRequested: 'Return Requested',
    returnEligible: 'Return eligible until', returnExpired: 'Return period expired',
    returnReason: 'Return Reason', submitReturn: 'Submit Return Request',
    selectColor: 'Select Color', availableQty: 'Available Quantity',
    noOrders: 'No orders yet', loginFirst: 'Please login first', loading: 'Loading...',
    followUs: 'Follow Us', contactUs: 'Contact Us', storePolicies: 'Store Policies',
    returnPolicy15: 'Return Policy: 15 days', shippingAllGov: 'Shipping all over Egypt',
    rights: `All rights reserved © ${BRAND}`,
    dashboard: 'Dashboard', addProduct: 'Add Product', lowStock: 'Low Stock',
    approve: 'Approve', reject: 'Reject', delete: 'Delete', edit: 'Edit', save: 'Save', cancel: 'Cancel',
    netProfit: 'Net Profit', totalRevenue: 'Total Revenue',
    adminCategories: 'Categories', adminReturns: 'Returns',
    colorVariants: 'Colors & Stock', addColor: 'Add Color', color: 'Color', quantity: 'Quantity',
  },
};

export const BRAND_NAME = BRAND;

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'ar');
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
  }, [lang]);
  const toggleLang = () => setLang(l => l === 'ar' ? 'en' : 'ar');
  const t = key => T[lang][key] || key;
  return <LangContext.Provider value={{ lang, toggleLang, t, brand: BRAND }}>{children}</LangContext.Provider>;
};

export const useLang = () => useContext(LangContext);
