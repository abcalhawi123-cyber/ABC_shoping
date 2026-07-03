import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLang } from '../context/LangContext';
import { useAuth } from '../context/AuthContext';
import { getMyOrders, submitReturn } from '../api';
import toast from 'react-hot-toast';

const BG = '#6D1A36';

const SC = {
  'قيد المراجعة': { bg: '#fff3e0', c: '#ef6c00' },
  'جاري التجهيز': { bg: '#e3f2fd', c: '#1565c0' },
  'تم الشحن':    { bg: '#e8eaf6', c: '#3949ab' },
  'تم التسليم':  { bg: '#e8f5e9', c: '#2e7d32' },
  'مرتجع':       { bg: '#ffebee', c: '#c62828' },
};

// Return modal component
function ReturnModal({ item, orderId, onClose, onSuccess }) {
  const { t, lang } = useLang();
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!reason.trim()) return toast.error(lang === 'ar' ? 'أدخل سبب الإرجاع' : 'Enter return reason');
    setBusy(true);
    try {
      await submitReturn({
        orderId,
        productId: item.product,              // FIX Bug 4: needed for restock
        productName: item.name,
        productImage: item.image,
        selectedColor: item.selectedColor || null, // FIX Bug 4: which variant to restock
        quantity: item.quantity,
        reason: reason.trim(),
      });
      toast.success(lang === 'ar' ? 'تم إرسال طلب الإرجاع ✓' : 'Return request sent ✓');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || (lang === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    }
    setBusy(false);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: 24, width: '100%', maxWidth: 420 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={{ margin: 0, color: BG }}>🔄 {t('returnBtn')}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#888' }}>✕</button>
        </div>
        <p style={{ fontSize: 14, color: '#555', marginBottom: 14 }}>
          <strong>{lang === 'ar' ? 'المنتج:' : 'Product:'}</strong> {item.name?.[lang] || item.name?.ar}
        </p>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#555', fontSize: 14 }}>{t('returnReason')}</label>
          <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
            placeholder={lang === 'ar' ? 'اكتب سبب الإرجاع...' : 'Write the return reason...'}
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={submit} disabled={busy}
            style={{ flex: 1, padding: '11px', background: busy ? '#ccc' : BG, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer', fontSize: 14 }}>
            {busy ? '...' : t('submitReturn')}
          </button>
          <button onClick={onClose} style={{ padding: '11px 18px', background: '#f5f5f5', color: '#555', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
            {t('cancel')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyOrders() {
  const { lang, t, brand } = useLang();
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [returnModal, setReturnModal] = useState(null); // { item, orderId }

  const load = (p = 1) => {
    setLoading(true);
    getMyOrders(p)
      .then(r => { setOrders(r.data.data); setPages(r.data.pagination.pages); setPage(p); })
      .catch(() => toast.error(lang === 'ar' ? 'فشل تحميل الطلبات' : 'Failed to load orders'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { if (user) load(); else setLoading(false); }, [user]);

  const isReturnEligible = (order) => {
    if (!['تم التسليم'].includes(order.status)) return false;
    return Date.now() - new Date(order.createdAt).getTime() <= 15 * 24 * 60 * 60 * 1000;
  };

  if (!user) return (
    <div style={{ textAlign: 'center', padding: '80px 20px' }}>
      <p style={{ fontSize: 52 }}>🔒</p>
      <h2 style={{ color: BG }}>{t('loginFirst')}</h2>
      <Link to="/login" style={{ display: 'inline-block', marginTop: 16, padding: '12px 28px', background: BG, color: '#fff', textDecoration: 'none', borderRadius: 10, fontWeight: 600 }}>
        {t('login')}
      </Link>
    </div>
  );

  return (
    <>
      <Helmet><title>{t('myOrders')} — {brand}</title></Helmet>
      <h1 style={{ color: BG, marginBottom: 20, fontSize: 22 }}>📦 {t('myOrders')}</h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>{t('loading')}</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#888' }}>
          <p style={{ fontSize: 52 }}>📭</p>
          <p style={{ fontSize: 16, marginBottom: 20 }}>{t('noOrders')}</p>
          <Link to="/products" style={{ padding: '12px 28px', background: BG, color: '#fff', textDecoration: 'none', borderRadius: 10, fontWeight: 600 }}>
            {t('shopNow')}
          </Link>
        </div>
      ) : (
        <>
          {orders.map(order => {
            const s = SC[order.status] || { bg: '#f5f5f5', c: '#333' };
            const eligible = isReturnEligible(order);
            const deadline = new Date(new Date(order.createdAt).getTime() + 15 * 24 * 60 * 60 * 1000);

            return (
              <div key={order._id} style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 14, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid #f0e0e5' }}>
                {/* Order header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                  <div>
                    <p style={{ margin: '0 0 3px', fontSize: 11, color: '#bbb', fontFamily: 'monospace' }}>#{order._id.slice(-8).toUpperCase()}</p>
                    <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{new Date(order.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB')}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{ background: s.bg, color: s.c, padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{order.status}</span>
                    <span style={{ fontWeight: 700, color: BG, fontSize: 16 }}>{order.total} ج.م</span>
                  </div>
                </div>

                {/* Items — each with its own Return button */}
                <div style={{ borderTop: '1px solid #f5f5f5', paddingTop: 10, marginBottom: 12 }}>
                  {order.items?.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1 }}>
                        {item.image && <img src={item.image} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />}
                        <div>
                          <p style={{ margin: 0, fontSize: 14, color: '#333', fontWeight: 500 }}>{item.name?.[lang] || item.name?.ar} × {item.quantity}</p>
                          {item.selectedColor && ( // FIX Bug 2: display selected color
                            <p style={{ margin: '2px 0 0', fontSize: 11, color: '#6D1A36' }}>🎨 {item.selectedColor}</p>
                          )}
                          <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{(item.unitPrice * item.quantity).toFixed(0)} ج.م</p>
                        </div>
                      </div>
                      {/* Per-item return button */}
                      {eligible && (
                        <button onClick={() => setReturnModal({ item, orderId: order._id })}
                          style={{ padding: '5px 12px', background: '#fff5f0', color: '#c0392b', border: '1px solid #f5c6c6', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                          🔄 {t('returnBtn')}
                        </button>
                      )}
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#aaa', marginTop: 6 }}>
                    <span>{lang === 'ar' ? 'رسوم الشحن' : 'Shipping'}</span>
                    <span>{order.shippingFee} ج.م</span>
                  </div>
                </div>

                {/* Footer actions */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderTop: '1px solid #f5f5f5', paddingTop: 10, alignItems: 'center' }}>
                  <Link to={`/track/${order._id}`} style={{ padding: '7px 14px', background: '#e3f2fd', color: '#1565c0', textDecoration: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                    📍 {t('trackOrder')}
                  </Link>
                  {eligible && (
                    <span style={{ fontSize: 11, color: '#27ae60' }}>
                      {t('returnEligible')}: {deadline.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB')}
                    </span>
                  )}
                  {order.status === 'مرتجع' && (
                    <span style={{ padding: '7px 12px', background: '#ffebee', color: '#c62828', borderRadius: 8, fontSize: 12, fontWeight: 600 }}>
                      ✓ {t('returnRequested')}
                    </span>
                  )}
                  {order.paymentMethod === 'instapay' && (
                    <span style={{ padding: '5px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600, background: order.paymentStatus === 'approved' ? '#e8f5e9' : order.paymentStatus === 'rejected' ? '#ffebee' : '#fff3e0', color: order.paymentStatus === 'approved' ? '#27ae60' : order.paymentStatus === 'rejected' ? '#e74c3c' : '#ef6c00' }}>
                      📱 {order.paymentStatus === 'approved' ? (lang === 'ar' ? 'مقبول' : 'Approved') : order.paymentStatus === 'rejected' ? (lang === 'ar' ? 'مرفوض' : 'Rejected') : (lang === 'ar' ? 'قيد المراجعة' : 'Pending')}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {pages > 1 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
              {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => load(p)} style={{ padding: '8px 14px', borderRadius: 8, background: p === page ? BG : '#fff', color: p === page ? '#fff' : '#333', border: '1px solid #ddd', cursor: 'pointer', fontWeight: p === page ? 700 : 400 }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Return Modal */}
      {returnModal && (
        <ReturnModal
          item={returnModal.item}
          orderId={returnModal.orderId}
          onClose={() => setReturnModal(null)}
          onSuccess={() => load(page)}
        />
      )}
    </>
  );
}
