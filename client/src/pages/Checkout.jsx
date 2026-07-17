import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLang } from '../context/LangContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getShippingZones, placeOrder } from '../api';
import toast from 'react-hot-toast';

const COD_FEE = 12; // Extra fee for Cash on Delivery — must match server (order.routes.js)
const INSTAPAY_NUMBER = '01212957890';
const INSTAPAY_IPA = 'abc-stock@instapay';
const INSTAPAY_QR = '/qr.jpg';

export default function Checkout() {
  const { t, lang, brand } = useLang();
  const { cart, subtotal, dispatch, itemKey } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [zones, setZones] = useState([]);
  const [zone, setZone] = useState(null);
  const [pay, setPay] = useState('cod'); // 'cod' | 'instapay' — Paymob/card removed
  const [ss, setSs] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    customerName: user?.name || '', customerEmail: user?.email || '',
    customerPhone: user?.phone || '', governorate: '', city: '',
    street: '', building: '', instapayTransactionId: '',
  });

  useEffect(() => { getShippingZones().then(r => setZones(r.data.data)).catch(() => {}); }, []);
  useEffect(() => {
    const found = zones.find(z => z.governorate.ar === form.governorate || z.governorate.en === form.governorate);
    setZone(found || null);
  }, [form.governorate, zones]);

  const codFee = pay === 'cod' ? COD_FEE : 0;
  const total = subtotal + (zone?.price || 0) + codFee;

  const submit = async e => {
    e.preventDefault();
    if (!cart?.length) return toast.error(lang === 'ar' ? 'السلة فارغة' : 'Cart is empty');
    if (!zone) return toast.error(lang === 'ar' ? 'اختر المحافظة' : 'Select governorate');
    if (pay === 'instapay' && !form.instapayTransactionId) return toast.error(lang === 'ar' ? 'أدخل كود العملية' : 'Enter transaction ID');
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('paymentMethod', pay);
      fd.append('items', JSON.stringify(cart.map(i => ({
        productId: i._id,
        quantity: i.qty,
        selectedColor: i.selectedColor || null,
      }))));
      if (user?._id) fd.append('userId', user._id);
      if (ss) fd.append('instapayScreenshot', ss);
      const { data } = await placeOrder(fd);
      dispatch({ type: 'CLEAR' });
      navigate(`/order-confirmation/${data.data.orderId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || (lang === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    }
    setBusy(false);
  };

  const F = (key, label, type = 'text', req = true) => (
    <div style={{ marginBottom: 14 }}>
      <label style={ls}>{label}</label>
      <input type={type} required={req} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={is} />
    </div>
  );

  return (
    <>
      <Helmet><title>{t('checkout')} — {brand}</title></Helmet>
      <h1 style={{ color: '#6D1A36', marginBottom: 20, fontSize: 22 }}>{t('checkout')}</h1>

      <div className="grid-checkout">
        <form onSubmit={submit}>
          <div style={sec}>
            <h3 style={secT}>📋 {t('contactInfo')}</h3>
            {F('customerName', t('yourName'))}
            {F('customerEmail', t('yourEmail'), 'email')}
            {F('customerPhone', t('yourPhone'), 'tel')}
          </div>

          <div style={sec}>
            <h3 style={secT}>🚚 {t('shippingAddress')}</h3>
            <div style={{ marginBottom: 14 }}>
              <label style={ls}>{t('governorate')}</label>
              <select required value={form.governorate} onChange={e => setForm({ ...form, governorate: e.target.value })} style={is}>
                <option value="">{t('selectGovernorate')}</option>
                {zones.map(z => <option key={z._id} value={z.governorate.ar}>{lang === 'ar' ? z.governorate.ar : z.governorate.en}</option>)}
              </select>
              {zone && (
                <p style={{ fontSize: 13, color: '#27ae60', marginTop: 6, marginBottom: 0 }}>
                  🚚 {lang === 'ar' ? 'رسوم الشحن:' : 'Shipping:'} {zone.price} ج.م &nbsp;|&nbsp;
                  {lang === 'ar' ? 'التوصيل:' : 'Delivery:'} {zone.estimatedDays.min}–{zone.estimatedDays.max} {lang === 'ar' ? 'أيام' : 'days'}
                </p>
              )}
            </div>
            {F('city', t('city'))}
            {F('street', t('street'))}
            {F('building', t('building'), 'text', false)}
          </div>

          {/* Payment Method — Paymob/card removed, only COD + InstaPay */}
          <div style={sec}>
            <h3 style={secT}>💳 {t('paymentMethod')}</h3>
            {[
              { v: 'cod', l: `💵 ${t('cod')} (+${COD_FEE} ج.م)` },
              { v: 'instapay', l: `📱 ${t('instapay')}` },
            ].map(m => (
              <label key={m.v} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer' }}>
                <input type="radio" name="pay" value={m.v} checked={pay === m.v} onChange={() => setPay(m.v)} style={{ width: 18, height: 18 }} />
                <span style={{ fontWeight: 500, fontSize: 15 }}>{m.l}</span>
              </label>
            ))}

            {pay === 'cod' && (
              <div style={{ background: '#fff8e1', borderRadius: 10, padding: 12, marginTop: 4, border: '1px solid #ffe082' }}>
                <p style={{ margin: 0, fontSize: 13, color: '#8a6100' }}>
                  ℹ️ {lang === 'ar'
                    ? `يُضاف رسم إضافي قدره ${COD_FEE} ج.م على الدفع عند الاستلام.`
                    : `An extra fee of ${COD_FEE} EGP applies to Cash on Delivery.`}
                </p>
              </div>
            )}

            {pay === 'instapay' && (
              <div style={{ background: '#f0f8ff', borderRadius: 10, padding: 14, marginTop: 8, border: '1px solid #bbdefb' }}>
                <p style={{ margin: '0 0 12px', fontSize: 14, color: '#6D1A36', fontWeight: 600 }}>
                  📲 {lang === 'ar' ? 'حول المبلغ' : 'Transfer'} <strong>{total.toFixed(0)} ج.م</strong> {lang === 'ar' ? 'على InstaPay' : 'via InstaPay'}
                </p>

                {/* InstaPay transfer details */}
                <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14, background: '#fff', borderRadius: 8, padding: 12 }}>
                  <img src={INSTAPAY_QR} alt="InstaPay QR" style={{ width: 220, height: 220, objectFit: 'contain', borderRadius: 6, flexShrink: 0 }} />
                  <div style={{ fontSize: 13, color: '#333', lineHeight: 1.8 }}>
                    <p style={{ margin: 0 }}>
                      <strong>{lang === 'ar' ? 'رقم InstaPay:' : 'InstaPay Number:'}</strong>{' '}
                      <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{INSTAPAY_NUMBER}</span>
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>IPA:</strong>{' '}
                      <span style={{ fontFamily: 'monospace', fontWeight: 700 }}>{INSTAPAY_IPA}</span>
                    </p>
                  </div>
                </div>

                {F('instapayTransactionId', t('transactionId'))}
                <div>
                  <label style={ls}>{t('uploadScreenshot')}</label>
                  <input type="file" accept="image/*" onChange={e => setSs(e.target.files[0])} style={{ ...is, padding: 8 }} />
                </div>
              </div>
            )}
          </div>

          <button type="submit" disabled={busy} style={{ width: '100%', padding: '15px', background: busy ? '#aaa' : '#6D1A36', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer' }}>
            {busy ? (lang === 'ar' ? 'جاري المعالجة...' : 'Processing...') : t('placeOrder')}
          </button>
        </form>

        {/* Order Summary */}
        <div className="sticky-summary" style={{ position: 'sticky', top: 90 }}>
          <div style={sec}>
            <h3 style={secT}>🛒 {t('orderSummary')}</h3>
            {cart?.map(item => {
              const key = itemKey ? itemKey(item) : item._id;
              const name = item.name?.[lang] || item.name?.ar || '';
              const price = item.sellingPrice * (1 - (item.discount || 0) / 100);
              return (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span style={{ flex: 1, color: '#555', marginInlineEnd: 8 }}>
                    {name}{item.selectedColor ? ` (${item.selectedColor})` : ''} × {item.qty}
                  </span>
                  <strong style={{ flexShrink: 0 }}>{(price * item.qty).toFixed(0)} ج.م</strong>
                </div>
              );
            })}
            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
              <span style={{ color: '#555' }}>{t('subtotal')}</span>
              <span>{subtotal.toFixed(0)} ج.م</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
              <span style={{ color: '#555' }}>{t('shippingFee')}</span>
              <span style={{ color: zone ? '#27ae60' : '#888' }}>{zone ? `${zone.price} ج.م` : '—'}</span>
            </div>
            {codFee > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontSize: 14 }}>
                <span style={{ color: '#555' }}>{lang === 'ar' ? 'رسوم الدفع عند الاستلام' : 'COD Fee'}</span>
                <span style={{ color: '#e67e22' }}>{codFee} ج.م</span>
              </div>
            )}
            <hr style={{ border: 'none', borderTop: '2px solid #6D1A36', margin: '0 0 12px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 20 }}>
              <span>{t('total')}</span>
              <span style={{ color: '#6D1A36' }}>{total.toFixed(0)} ج.م</span>
            </div>
            <p style={{ fontSize: 12, color: '#888', marginTop: 10, textAlign: 'center' }}>{t('returnPolicy')}</p>
          </div>
        </div>
      </div>
    </>
  );
}

const sec = { background: '#fff', borderRadius: 12, padding: 18, marginBottom: 16, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f0e8e8' };
const secT = { margin: '0 0 14px', color: '#6D1A36', fontSize: 16, fontWeight: 700 };
const is = { width: '100%', padding: '11px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', background: '#fafafa' };
const ls = { display: 'block', marginBottom: 6, fontWeight: 600, color: '#555', fontSize: 14 };
