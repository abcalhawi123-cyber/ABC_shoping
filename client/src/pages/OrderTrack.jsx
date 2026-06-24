import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { getOrder } from '../api';

const STEPS_AR = ['قيد المراجعة', 'جاري التجهيز', 'تم الشحن', 'تم التسليم'];
const STEPS_EN = ['Under Review', 'Processing', 'Shipped', 'Delivered'];

export default function OrderTrack() {
  const { id } = useParams();
  const { lang, t } = useLang();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrder(id).then(r => { setOrder(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const step = STEPS_AR.indexOf(order?.status);
  const DISPLAY = lang === 'ar' ? STEPS_AR : STEPS_EN;

  return (
    <div style={{ maxWidth: 580, margin: '0 auto', padding: '20px 16px' }}>
      <h1 style={{ color: '#1a3a5c', marginBottom: 6, fontSize: 22 }}>📦 {t('trackOrder')}</h1>
      <p style={{ color: '#888', marginBottom: 24, fontSize: 13 }}>
        {lang === 'ar' ? 'رقم الطلب:' : 'Order ID:'} <span style={{ fontFamily: 'monospace', color: '#1a3a5c', fontWeight: 600 }}>{id?.slice(-8).toUpperCase()}</span>
      </p>

      {loading ? (
        <p style={{ color: '#888' }}>{t('loading')}</p>
      ) : !order ? (
        <p style={{ color: '#e74c3c' }}>{lang === 'ar' ? 'الطلب غير موجود' : 'Order not found'}</p>
      ) : (
        <>
          {/* Progress bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 15, right: '7%', left: '7%', height: 3, background: '#f0f2f5', zIndex: 0 }}>
              <div style={{ width: `${Math.max(0, step / (STEPS_AR.length - 1)) * 100}%`, height: '100%', background: '#1a3a5c', transition: 'width 0.6s ease' }} />
            </div>
            {STEPS_AR.map((s, i) => (
              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                <div style={{
                  width: 30, height: 30, borderRadius: '50%',
                  background: i <= step ? '#1a3a5c' : '#e0e0e0',
                  color: i <= step ? '#fff' : '#aaa',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 13, marginBottom: 6,
                  border: i === step ? '3px solid #f8ad9d' : '3px solid transparent',
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 'clamp(9px,2vw,11px)', color: i <= step ? '#1a3a5c' : '#aaa', fontWeight: i === step ? 700 : 400, textAlign: 'center', maxWidth: 64 }}>
                  {DISPLAY[i]}
                </span>
              </div>
            ))}
          </div>

          {order.status === 'مرتجع' && (
            <div style={{ background: '#ffebee', borderRadius: 10, padding: '12px 16px', marginBottom: 16, color: '#c62828', fontWeight: 600, fontSize: 14 }}>
              🔄 {lang === 'ar' ? 'تم تسجيل طلب الإرجاع.' : 'Return request registered.'}
            </div>
          )}

          {/* Items */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: 14 }}>
            <h3 style={{ color: '#1a3a5c', margin: '0 0 12px', fontSize: 15 }}>
              {lang === 'ar' ? 'منتجات الطلب' : 'Order Items'}
            </h3>
            {order.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, borderBottom: '1px solid #f5f5f5', paddingBottom: 8 }}>
                <span style={{ color: '#555' }}>{item.name?.[lang] || item.name?.ar} × {item.quantity}</span>
                <span style={{ fontWeight: 600 }}>{(item.unitPrice * item.quantity).toFixed(0)} ج.م</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', marginTop: 4, marginBottom: 6 }}>
              <span>{lang === 'ar' ? 'رسوم الشحن' : 'Shipping'}</span><span>{order.shippingFee} ج.م</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, color: '#1a3a5c', marginTop: 8 }}>
              <span>{t('total')}</span><span>{order.total} ج.م</span>
            </div>
          </div>

          {/* Status history */}
          {order.statusHistory?.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 12, padding: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
              <h3 style={{ color: '#1a3a5c', margin: '0 0 12px', fontSize: 15 }}>
                {lang === 'ar' ? 'سجل التحديثات' : 'Status History'}
              </h3>
              {order.statusHistory.slice().reverse().map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8, flexWrap: 'wrap', gap: 4 }}>
                  <span style={{ fontWeight: 600, color: '#1a3a5c' }}>{h.status}</span>
                  <span style={{ color: '#aaa' }}>{new Date(h.changedAt).toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-GB')}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
