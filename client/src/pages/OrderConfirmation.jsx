import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { getOrder } from '../api';

export default function OrderConfirmation() {
  const { id } = useParams();
  const { lang, t } = useLang();
  const [order, setOrder] = useState(null);

  useEffect(() => { getOrder(id).then(r => setOrder(r.data.data)).catch(() => {}); }, [id]);

  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: 560, margin: '0 auto' }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
      <h1 style={{ color: '#27ae60', marginBottom: 8 }}>
        {lang === 'ar' ? 'تم تأكيد طلبك!' : 'Order Confirmed!'}
      </h1>
      <p style={{ color: '#888', marginBottom: 24 }}>
        {lang === 'ar' ? 'رقم الطلب:' : 'Order ID:'} <strong style={{ color: '#1a3a5c' }}>{id}</strong>
      </p>

      {order && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 24, textAlign: lang === 'ar' ? 'right' : 'left' }}>
          <p><strong>{lang === 'ar' ? 'الاسم:' : 'Name:'}</strong> {order.customer?.name}</p>
          <p><strong>{lang === 'ar' ? 'الإجمالي:' : 'Total:'}</strong> {order.total} ج.م</p>
          <p><strong>{lang === 'ar' ? 'طريقة الدفع:' : 'Payment:'}</strong> {order.paymentMethod === 'cod' ? (lang === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery') : order.paymentMethod}</p>
          <p><strong>{lang === 'ar' ? 'التوصيل المتوقع:' : 'Delivery:'}</strong> {order.estimatedDeliveryDays?.min}–{order.estimatedDeliveryDays?.max} {lang === 'ar' ? 'أيام' : 'days'}</p>
          <p style={{ margin: 0 }}><strong>{lang === 'ar' ? 'الحالة:' : 'Status:'}</strong> <span style={{ color: '#ef6c00', fontWeight: 600 }}>{order.status}</span></p>
        </div>
      )}

      {order?.paymentMethod === 'instapay' && order?.paymentStatus === 'pending' && (
        <div style={{ background: '#fff3e0', borderRadius: 10, padding: 14, marginBottom: 20, border: '1px solid #ffcc80' }}>
          <p style={{ margin: 0, color: '#ef6c00', fontSize: 14 }}>
            ⏳ {lang === 'ar' ? 'طلبك قيد المراجعة — سنتحقق من تحويل InstaPay وسنبدأ التجهيز قريباً.' : 'Your order is under review — we will verify your InstaPay transfer shortly.'}
          </p>
        </div>
      )}

      <p style={{ fontSize: 13, color: '#aaa', marginBottom: 24 }}>{t('returnPolicy')}</p>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to={`/track/${id}`} style={{ padding: '12px 24px', background: '#1a3a5c', color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 600 }}>
          {t('trackOrder')}
        </Link>
        <Link to="/my-orders" style={{ padding: '12px 24px', background: '#e3f2fd', color: '#1565c0', textDecoration: 'none', borderRadius: 8, fontWeight: 600 }}>
          📦 {t('myOrders')}
        </Link>
        <Link to="/" style={{ padding: '12px 24px', background: '#f5f5f5', color: '#555', textDecoration: 'none', borderRadius: 8, fontWeight: 600 }}>
          {lang === 'ar' ? 'الرئيسية' : 'Home'}
        </Link>
      </div>
    </div>
  );
}
