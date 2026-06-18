import { createContext, useContext, useState, useEffect } from 'react';

const LangContext = createContext();

const T = {
  ar: {
    home:'الرئيسية', products:'المنتجات', cart:'السلة', login:'تسجيل الدخول',
    register:'إنشاء حساب', logout:'تسجيل الخروج', search:'ابحث عن منتج...',
    addToCart:'أضف للسلة', outOfStock:'غير متوفر', reviews:'التقييمات',
    noReviews:'لا توجد تقييمات', loadMoreReviews:'تحميل المزيد',
    writeReview:'اكتب تقييمك', submitReview:'إرسال التقييم',
    cartEmpty:'السلة فارغة', subtotal:'المجموع', shippingFee:'رسوم الشحن',
    total:'الإجمالي', checkout:'إتمام الشراء', yourName:'الاسم الكامل',
    yourEmail:'البريد الإلكتروني', yourPhone:'رقم الهاتف',
    governorate:'المحافظة', city:'المدينة', street:'الشارع', building:'رقم المبنى',
    paymentMethod:'طريقة الدفع', cod:'الدفع عند الاستلام', instapay:'InstaPay',
    card:'بطاقة ائتمانية', transactionId:'كود العملية',
    uploadScreenshot:'رفع صورة التحويل', placeOrder:'تأكيد الطلب',
    returnPolicy:'سياسة الإرجاع: 15 يوم من تاريخ الطلب',
    followUs:'تابعنا', contactUs:'تواصل معنا',
    rights:'جميع الحقوق محفوظة © ABC الحاوي',
  },
  en: {
    home:'Home', products:'Products', cart:'Cart', login:'Login',
    register:'Register', logout:'Logout', search:'Search products...',
    addToCart:'Add to Cart', outOfStock:'Out of Stock', reviews:'Reviews',
    noReviews:'No reviews yet', loadMoreReviews:'Load More',
    writeReview:'Write a Review', submitReview:'Submit Review',
    cartEmpty:'Your cart is empty', subtotal:'Subtotal', shippingFee:'Shipping Fee',
    total:'Total', checkout:'Checkout', yourName:'Full Name',
    yourEmail:'Email', yourPhone:'Phone', governorate:'Governorate',
    city:'City', street:'Street', building:'Building No.',
    paymentMethod:'Payment Method', cod:'Cash on Delivery', instapay:'InstaPay',
    card:'Credit / Debit Card', transactionId:'Transaction ID',
    uploadScreenshot:'Upload Screenshot', placeOrder:'Place Order',
    returnPolicy:'Return Policy: 15 days from order date',
    followUs:'Follow Us', contactUs:'Contact Us',
    rights:'All rights reserved © ABC Al-Hawi',
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
  const t = key => T[lang][key] || key;
  return <LangContext.Provider value={{ lang, toggleLang, t }}>{children}</LangContext.Provider>;
};

export const useLang = () => useContext(LangContext);
