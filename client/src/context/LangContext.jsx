import { createContext, useContext, useState, useEffect } from 'react';

const LangContext = createContext();

const translations = {
  ar: {
    home: 'الرئيسية', products: 'المنتجات', cart: 'السلة',
    login: 'تسجيل الدخول', register: 'إنشاء حساب', logout: 'تسجيل الخروج',
    search: 'ابحث عن منتج...', addToCart: 'أضف للسلة', outOfStock: 'غير متوفر',
    price: 'السعر', discount: 'خصم', category: 'الفئة', rating: 'التقييم',
    reviews: 'التقييمات', noReviews: 'لا توجد تقييمات بعد',
    loadMoreReviews: 'تحميل المزيد', writeReview: 'اكتب تقييمك',
    submitReview: 'إرسال التقييم', cartEmpty: 'السلة فارغة',
    subtotal: 'المجموع', shippingFee: 'رسوم الشحن', total: 'الإجمالي',
    checkout: 'إتمام الشراء', yourName: 'الاسم', yourEmail: 'البريد الإلكتروني',
    yourPhone: 'رقم الهاتف', governorate: 'المحافظة', city: 'المدينة',
    street: 'الشارع', building: 'رقم المبنى', paymentMethod: 'طريقة الدفع',
    cod: 'الدفع عند الاستلام', instapay: 'InstaPay', card: 'بطاقة ائتمانية',
    transactionId: 'كود العملية', uploadScreenshot: 'رفع صورة التحويل',
    placeOrder: 'تأكيد الطلب', orderPlaced: 'تم الطلب بنجاح!',
    trackOrder: 'تتبع الطلب', orderStatus: 'حالة الطلب',
    returnPolicy: 'سياسة الإرجاع: 15 يوم من تاريخ الطلب',
    followUs: 'تابعنا', contactUs: 'تواصل معنا',
    rights: 'جميع الحقوق محفوظة © ABC الحاوي',
    dashboard: 'لوحة التحكم', addProduct: 'إضافة منتج',
    lowStock: 'مخزون منخفض', pendingApproval: 'بانتظار الموافقة',
    approve: 'موافقة', reject: 'رفض', delete: 'حذف', edit: 'تعديل',
    save: 'حفظ', cancel: 'إلغاء', netProfit: 'الربح الصافي',
    totalRevenue: 'إجمالي الإيرادات',
  },
  en: {
    home: 'Home', products: 'Products', cart: 'Cart',
    login: 'Login', register: 'Register', logout: 'Logout',
    search: 'Search products...', addToCart: 'Add to Cart', outOfStock: 'Out of Stock',
    price: 'Price', discount: 'Discount', category: 'Category', rating: 'Rating',
    reviews: 'Reviews', noReviews: 'No reviews yet',
    loadMoreReviews: 'Load More', writeReview: 'Write a Review',
    submitReview: 'Submit Review', cartEmpty: 'Your cart is empty',
    subtotal: 'Subtotal', shippingFee: 'Shipping Fee', total: 'Total',
    checkout: 'Checkout', yourName: 'Full Name', yourEmail: 'Email',
    yourPhone: 'Phone', governorate: 'Governorate', city: 'City',
    street: 'Street', building: 'Building No.', paymentMethod: 'Payment Method',
    cod: 'Cash on Delivery', instapay: 'InstaPay', card: 'Credit / Debit Card',
    transactionId: 'Transaction ID', uploadScreenshot: 'Upload Transfer Screenshot',
    placeOrder: 'Place Order', orderPlaced: 'Order Placed Successfully!',
    trackOrder: 'Track Order', orderStatus: 'Order Status',
    returnPolicy: 'Return Policy: 15 days from order date',
    followUs: 'Follow Us', contactUs: 'Contact Us',
    rights: 'All rights reserved © ABC Al-Hawi',
    dashboard: 'Dashboard', addProduct: 'Add Product',
    lowStock: 'Low Stock', pendingApproval: 'Pending Approval',
    approve: 'Approve', reject: 'Reject', delete: 'Delete', edit: 'Edit',
    save: 'Save', cancel: 'Cancel', netProfit: 'Net Profit',
    totalRevenue: 'Total Revenue',
  },
};

export const LangProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'ar');

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    localStorage.setItem('lang', lang);
  }, [lang]);

  const toggleLang = () => setLang(l => l === 'ar' ? 'en' : 'ar');
  const t = (key) => translations[lang][key] || key;

  return (
    <LangContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LangContext.Provider>
  );
};

export const useLang = () => useContext(LangContext);
