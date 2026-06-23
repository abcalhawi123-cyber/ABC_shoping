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
    getOrder(id)
      .then(r => { setOrder(r.data.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const STEPS = STEPS_AR; // status always stored in Arabic
  const STEPS_DISPLAY = lang === 'ar' ? STEPS_AR : STEPS_EN;
  const step = STEPS.indexOf(order?.status);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 0' }}>
      <h1 style={{ color: '#1a3a5c', marginBottom: 8 }}>📦 {t('trackOrder')}</h1>
      <p style={{ color: '#888', marginBottom: 28 }}>
        {lang === 'ar' ? 'رقم الطلب:' : 'Order ID:'} {id}
      </p>

      {loading ? (
        <p>{t('loading')}</p>
      ) : !order ? (
        <p style={{ color: '#e74c3c' }}>{lang === 'ar' ? 'الطلب غير موجود' : 'Order not found'}</p>
      ) : (
        <>
          {/* Progress steps */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 36, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 16, right: '8%', left: '8%', height: 3, background: '#f0f2f5', zIndex: 0 }}>
              <div style={{ width: `${Math.max(0, step / (STEPS.length - 1)) * 100}%`, height: '100%', background: '#1a3a5c', transition: 'width 0.6s' }} />
            </div>
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: i <= step ? '#1a3a5c' : '#e0e0e0', color: i <= step ? '#fff' : '#aaa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, marginBottom: 8, border: i === step ? '3px solid #f8ad9d' : '3px solid transparent' }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 11, color: i <= step ? '#1a3a5c' : '#aaa', fontWeight: i === step ? 700 : 400, textAlign: 'center', maxWidth: 70 }}>
                  {STEPS_DISPLAY[i]}
                </span>
              </div>
            ))}
          </div>

          {order.status === 'مرتجع' && (
            <div style={{ background: '#ffebee', borderRadius: 10, padding: '14px 18px', marginBottom: 20, color: '#c62828', fontWeight: 600 }}>
              🔄 {lang === 'ar' ? 'تم تسجيل طلب الإرجاع.' : 'Return request registered.'}
            </div>
          )}

          {/* Order items */}
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', marginBottom: 16 }}>
            <h3 style={{ color: '#1a3a5c', margin: '0 0 14px' }}>
              {lang === 'ar' ? 'منتجات الطلب' : 'Order Items'}
            </h3>
            {order.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14, borderBottom: '1px solid #f5f5f5', paddingBottom: 8 }}>
                <span>{item.name?.[lang] || item.name?.ar} × {item.quantity}</span>
                <span style={{ fontWeight: 600 }}>{(item.unitPrice * item.quantity).toFixed(0)} ج.م</span>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginTop: 8 }}>
              <span>{t('total')}</span>
              <span style={{ color: '#1a3a5c' }}>{order.total} ج.م</span>
            </div>
          </div>

          {/* Status history */}
          {order.statusHistory?.length > 0 && (
            <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <h3 style={{ color: '#1a3a5c', margin: '0 0 14px' }}>
                {lang === 'ar' ? 'سجل التحديثات' : 'Status History'}
              </h3>
              {order.statusHistory.slice().reverse().map((h, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                  <span style={{ fontWeight: 600 }}>{h.status}</span>
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
