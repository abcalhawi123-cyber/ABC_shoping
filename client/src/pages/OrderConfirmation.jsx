import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../api';

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    getOrder(id).then(r => setOrder(r.data.data)).catch(() => {});
  }, [id]);

  return (
    <div style={{ textAlign: 'center', padding: '60px 20px', maxWidth: 560, margin: '0 auto' }}>
      <div style={{ fontSize: 72, marginBottom: 16 }}>🎉</div>
      <h1 style={{ color: '#27ae60', marginBottom: 8 }}>تم تأكيد طلبك!</h1>
      <p style={{ color: '#888', marginBottom: 24 }}>رقم الطلب: <strong style={{ color: '#1a3a5c' }}>{id}</strong></p>
      {order && (
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 24, textAlign: 'right' }}>
          <p><strong>الاسم:</strong> {order.customer?.name}</p>
          <p><strong>الإجمالي:</strong> {order.total} ج.م</p>
          <p><strong>طريقة الدفع:</strong> {order.paymentMethod === 'cod' ? 'الدفع عند الاستلام' : order.paymentMethod}</p>
          <p><strong>التوصيل المتوقع:</strong> {order.estimatedDeliveryDays?.min}–{order.estimatedDeliveryDays?.max} أيام</p>
          <p><strong>الحالة:</strong> <span style={{ color: '#ef6c00', fontWeight: 600 }}>{order.status}</span></p>
        </div>
      )}
      {order?.paymentMethod === 'instapay' && order?.paymentStatus === 'pending' && (
        <div style={{ background: '#fff3e0', borderRadius: 10, padding: '14px', marginBottom: 20, border: '1px solid #ffcc80' }}>
          <p style={{ margin: 0, color: '#ef6c00', fontSize: 14 }}>⏳ طلبك قيد المراجعة — سنتحقق من تحويل InstaPay وسنبدأ التجهيز قريباً.</p>
        </div>
      )}
      <p style={{ fontSize: 13, color: '#aaa', marginBottom: 24 }}>🔄 سياسة الإرجاع: 15 يوم من تاريخ الطلب</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Link to={`/track/${id}`} style={{ padding: '12px 24px', background: '#1a3a5c', color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 600 }}>تتبع الطلب</Link>
        <Link to="/" style={{ padding: '12px 24px', background: '#f5f5f5', color: '#555', textDecoration: 'none', borderRadius: 8, fontWeight: 600 }}>الرئيسية</Link>
      </div>
    </div>
  );
}
