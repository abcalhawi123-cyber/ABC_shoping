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
    <div style={{ textAlign: 'center', padding: '48px 16px', maxWidth: 520, margin: '0 auto' }}>
      <div style={{ fontSize: 64, marginBottom: 12 }}>🎉</div>
      <h1 style={{ color: '#27ae60', marginBottom: 8, fontSize: 'clamp(20px,5vw,28px)' }}>
        {lang === 'ar' ? 'تم تأكيد طلبك!' : 'Order Confirmed!'}
      </h1>
      <p style={{ color: '#888', marginBottom: 20, fontSize: 14 }}>
        {lang === 'ar' ? 'رقم الطلب:' : 'Order ID:'} <strong style={{ color: '#6D1A36' }}>{id?.slice(-8).toUpperCase()}</strong>
      </p>

      {order && (
        <div style={{ background: '#fff', borderRadius: 12, padding: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 20, textAlign: lang === 'ar' ? 'right' : 'left' }}>
          <p style={pi}><strong>{lang === 'ar' ? 'الاسم:' : 'Name:'}</strong> {order.customer?.name}</p>
          <p style={pi}><strong>{lang === 'ar' ? 'الإجمالي:' : 'Total:'}</strong> {order.total} ج.م</p>
          <p style={pi}><strong>{lang === 'ar' ? 'طريقة الدفع:' : 'Payment:'}</strong> {order.paymentMethod === 'cod' ? (lang === 'ar' ? 'الدفع عند الاستلام' : 'Cash on Delivery') : order.paymentMethod}</p>
          <p style={{ ...pi, margin: 0 }}><strong>{lang === 'ar' ? 'الحالة:' : 'Status:'}</strong> <span style={{ color: '#ef6c00', fontWeight: 600 }}>{order.status}</span></p>
        </div>
      )}

      {order?.paymentMethod === 'instapay' && order?.paymentStatus === 'pending' && (
        <div style={{ background: '#fff3e0', borderRadius: 10, padding: '12px 14px', marginBottom: 16, border: '1px solid #ffcc80' }}>
          <p style={{ margin: 0, color: '#ef6c00', fontSize: 13 }}>
            ⏳ {lang === 'ar' ? 'طلبك قيد المراجعة — سنتحقق من تحويل InstaPay قريباً.' : 'Your order is under review — we will verify your InstaPay transfer shortly.'}
          </p>
        </div>
      )}

      <p style={{ fontSize: 12, color: '#aaa', marginBottom: 20 }}>{t('returnPolicy')}</p>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link to={`/track/${id}`} style={{ padding: '11px 20px', background: '#6D1A36', color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14 }}>
          {t('trackOrder')}
        </Link>
        <Link to="/my-orders" style={{ padding: '11px 20px', background: '#e3f2fd', color: '#1565c0', textDecoration: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14 }}>
          📦 {t('myOrders')}
        </Link>
        <Link to="/" style={{ padding: '11px 20px', background: '#f5f5f5', color: '#555', textDecoration: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14 }}>
          {lang === 'ar' ? 'الرئيسية' : 'Home'}
        </Link>
      </div>
    </div>
  );
}
const pi = { margin: '0 0 8px', fontSize: 14, color: '#444' };
