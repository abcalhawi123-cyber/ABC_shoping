import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrder } from '../api';

const STEPS = ['قيد المراجعة', 'جاري التجهيز', 'تم الشحن', 'تم التسليم'];

export default function OrderTrack() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id).then(r => { setOrder(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const currentStep = STEPS.indexOf(order?.status);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 0' }}>
      <h1 style={{ color: '#1a3a5c', marginBottom: 8 }}>📦 تتبع الطلب</h1>
      <p style={{ color: '#888', marginBottom: 28 }}>رقم الطلب: {id}</p>
      {loading ? <p>جاري التحميل...</p> : !order ? <p style={{ color: '#e74c3c' }}>الطلب غير موجود</p> : (
        <>
          {/* Progress */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 36, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 16, right: '8%', left: '8%', height: 3, background: '#f0f2f5', zIndex: 0 }}>
              <div style={{ width: `${Math.max(0, currentStep / (STEPS.length - 1)) * 100}%`, height: '100%', background: '#1a3a5c', transition: 'width 0.6s ease' }} />
            </div>
            {STEPS.map((step, i) => (
              <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                <div style={{
                  width: 34, height: 34, borderRadius: '50%',
                  background: i <= currentStep ? '#1a3a5c' : '#e0e0e0',
                  color: i <= currentStep ? '#fff' : '#aaa',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 14, marginBottom: 8,
                  border: i === currentStep ? '3px solid #f8ad9d' : '3px solid transparent',
                  transition: 'all 0.4s',
                }}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 11, color: i <= currentStep ? '#1a3a5c' : '#aaa', fontWeight: i === currentStep ? 700 : 400, textAlign: 'center' }}>{step}</span>
              </div>
            ))}
          </div>

          {order.status === 'مرتجع' && (
            <div style={{ background: '#ffebee', borderRadius: 10, padding: '14px 18px', marginBottom: 20, color: '#c62828', fontWeight: 600 }}>
              🔄 تم تسجيل الإرجاع — سيتم استرداد المبلغ قريباً.
            </div>
          )}

          <div style={{ background: '#fff', borderRadius: 12, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 20 }}>
            <h3 style={{ color: '#1a3a5c', margin: '0 0 14px' }}>منتجات الطلب</h3>
            {order.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, borderBottom: '1px solid #f5f5f5', paddingBottom: 8 }}>
                <span>{item.name?.ar} × {item.quantity}</span>
                <span style={{ fontWeight: 600 }}>{(item.unitPrice * item.quantity).toFixed(0)} ج.م</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginTop: 10 }}>
              <span>الإجمالي</span><span style={{ color: '#1a3a5c' }}>{order.total} ج.م</span>
            </div>
          </div>

          {/* Status history */}
          {order.statusHistory?.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 12, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ color: '#1a3a5c', margin: '0 0 14px' }}>سجل التحديثات</h3>
              {order.statusHistory.slice().reverse().map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ fontWeight: 600 }}>{h.status}</span>
                  <span style={{ color: '#aaa' }}>{new Date(h.changedAt).toLocaleString('ar-EG')}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
