import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import { getMyOrders } from '../api';
import toast from 'react-hot-toast';
import axios from 'axios';

const SC = {
  'قيد المراجعة': { bg: '#fff3e0', c: '#ef6c00' },
  'جاري التجهيز': { bg: '#e3f2fd', c: '#1565c0' },
  'تم الشحن':    { bg: '#e8eaf6', c: '#3949ab' },
  'تم التسليم':  { bg: '#e8f5e9', c: '#2e7d32' },
  'مرتجع':       { bg: '#ffebee', c: '#c62828' },
};

export default function MyOrders() {
  const { lang, t } = useLang();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const load = (p = 1) => {
    setLoading(true);
    getMyOrders(p)
      .then(r => { setOrders(r.data.data); setPages(r.data.pagination.pages); setPage(p); })
      .catch(() => toast.error(lang === 'ar' ? 'فشل تحميل الطلبات' : 'Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (user) load(); else setLoading(false); }, [user]);

  const canReturn = order => {
    if (order.status !== 'تم التسليم') return false;
    if (!order.isReturnEligible) return false;
    return Date.now() - new Date(order.createdAt).getTime() <= 15 * 24 * 60 * 60 * 1000;
  };

  const requestReturn = async orderId => {
    const reason = prompt(lang === 'ar' ? 'سبب الإرجاع:' : 'Return reason:');
    if (!reason) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}/return`,
        { reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(lang === 'ar' ? 'تم إرسال طلب الإرجاع ✓' : 'Return request sent ✓');
      load(page);
    } catch (err) {
      toast.error(err.response?.data?.message || (lang === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    }
  };

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '80px 0' }}>
      <p style={{ fontSize: 48 }}>🔒</p>
      <h2 style={{ color: '#1a3a5c' }}>{t('loginFirst')}</h2>
      <Link to="/login" style={{ display: 'inline-block', marginTop: 16, padding: '12px 28px', background: '#1a3a5c', color: '#fff', textDecoration: 'none', borderRadius: 10, fontWeight: 600 }}>
        {t('login')}
      </Link>
    </div>
  );

  return (
    <>
      <Helmet><title>{t('myOrders')} — ABC {lang === 'ar' ? 'الحاوي' : 'Al-Hawi'}</title></Helmet>
      <h1 style={{ color: '#1a3a5c', marginBottom: 24 }}>📦 {t('myOrders')}</h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>{t('loading')}</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
          <p style={{ fontSize: 48 }}>📭</p>
          <p style={{ fontSize: 16, marginBottom: 20 }}>{t('noOrders')}</p>
          <Link to="/products" style={{ padding: '12px 28px', background: '#1a3a5c', color: '#fff', textDecoration: 'none', borderRadius: 10, fontWeight: 600 }}>
            {t('shopNow')}
          </Link>
        </div>
      ) : (
        <>
          {orders.map(order => {
            const s = SC[order.status] || { bg: '#f5f5f5', c: '#333' };
            const eligible = canReturn(order);
            const deadline = new Date(new Date(order.createdAt).getTime() + 15 * 24 * 60 * 60 * 1000);

            return (
              <div key={order._id} style={{ background: '#fff', borderRadius: 12, padding: 20, marginBottom: 16, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid #f0e8e8' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <p style={{ margin: '0 0 3px', fontSize: 12, color: '#aaa' }}>
                      #{order._id.slice(-8).toUpperCase()}
                    </p>
                    <p style={{ margin: 0, fontSize: 13, color: '#888' }}>
                      {t('orderDate')}: {new Date(order.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB')}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ background: s.bg, color: s.c, padding: '5px 12px', borderRadius: 12, fontSize: 13, fontWeight: 600 }}>
                      {order.status}
                    </span>
                    <span style={{ fontWeight: 700, color: '#1a3a5c', fontSize: 17 }}>{order.total} ج.م</span>
                  </div>
                </div>

                {/* Items */}
                <div style={{ borderTop: '1px solid #f5f5f5', paddingTop: 12, marginBottom: 14 }}>
                  {order.items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 6, color: '#555' }}>
                      <span>{item.name?.[lang] || item.name?.ar} × {item.quantity}</span>
                      <span style={{ fontWeight: 600 }}>{(item.unitPrice * item.quantity).toFixed(0)} ج.م</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#888', marginTop: 6 }}>
                    <span>{lang === 'ar' ? 'رسوم الشحن' : 'Shipping'}</span>
                    <span>{order.shippingFee} ج.م</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', borderTop: '1px solid #f5f5f5', paddingTop: 12, alignItems: 'center' }}>
                  <Link to={`/track/${order._id}`} style={{ padding: '8px 16px', background: '#e3f2fd', color: '#1565c0', textDecoration: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                    📍 {t('trackOrder')}
                  </Link>

                  {eligible && (
                    <button onClick={() => requestReturn(order._id)} style={{ padding: '8px 16px', background: '#fff3e0', color: '#ef6c00', border: '1px solid #ffcc80', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      🔄 {t('requestReturn')}
                    </button>
                  )}

                  {order.status === 'تم التسليم' && order.isReturnEligible && (
                    <span style={{ fontSize: 12, color: eligible ? '#27ae60' : '#e74c3c' }}>
                      {eligible
                        ? `${t('returnEligible')}: ${deadline.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB')}`
                        : t('returnExpired')
                      }
                    </span>
                  )}

                  {order.status === 'مرتجع' && (
                    <span style={{ padding: '8px 12px', background: '#ffebee', color: '#c62828', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                      ✓ {t('returnRequested')}
                    </span>
                  )}

                  {/* Payment status badge */}
                  {order.paymentMethod === 'instapay' && (
                    <span style={{
                      padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                      background: order.paymentStatus === 'approved' ? '#e8f5e9' : order.paymentStatus === 'rejected' ? '#ffebee' : '#fff3e0',
                      color: order.paymentStatus === 'approved' ? '#27ae60' : order.paymentStatus === 'rejected' ? '#e74c3c' : '#ef6c00',
                    }}>
                      📱 InstaPay: {order.paymentStatus === 'approved' ? (lang === 'ar' ? 'مقبول' : 'Approved') : order.paymentStatus === 'rejected' ? (lang === 'ar' ? 'مرفوض' : 'Rejected') : (lang === 'ar' ? 'قيد المراجعة' : 'Pending')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Pagination */}
          {pages > 1 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 24 }}>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => load(p)} style={{ padding: '8px 14px', borderRadius: 8, background: p === page ? '#1a3a5c' : '#fff', color: p === page ? '#fff' : '#333', border: '1px solid #ddd', cursor: 'pointer', fontWeight: p === page ? 700 : 400 }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
