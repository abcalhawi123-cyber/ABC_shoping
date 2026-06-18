import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLang } from '../context/LangContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getShippingZones, placeOrder } from '../api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { t, lang } = useLang();
  const { cart, subtotal, dispatch } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [zones, setZones] = useState([]);
  const [zone, setZone] = useState(null);
  const [pay, setPay] = useState('cod');
  const [ss, setSs] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ customerName: user?.name || '', customerEmail: user?.email || '', customerPhone: user?.phone || '', governorate: '', city: '', street: '', building: '', instapayTransactionId: '' });

  useEffect(() => { getShippingZones().then(r => setZones(r.data.data)).catch(() => {}); }, []);
  useEffect(() => { setZone(zones.find(z => z.governorate.ar === form.governorate) || null); }, [form.governorate, zones]);

  const total = subtotal + (zone?.price || 0);

  const submit = async e => {
    e.preventDefault();
    if (!cart?.length) return toast.error('السلة فارغة');
    if (!zone) return toast.error('اختر المحافظة');
    if (pay === 'instapay' && !form.instapayTransactionId) return toast.error('أدخل كود العملية');
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('paymentMethod', pay);
      fd.append('items', JSON.stringify(cart.map(i => ({ productId: i._id, quantity: i.qty }))));
      if (user?._id) fd.append('userId', user._id);
      if (ss) fd.append('instapayScreenshot', ss);
      const { data } = await placeOrder(fd);
      dispatch({ type: 'CLEAR' });
      navigate(`/order-confirmation/${data.data.orderId}`);
    } catch (err) { toast.error(err.response?.data?.message || 'حدث خطأ'); }
    setBusy(false);
  };

  const F = (key, label, type = 'text', req = true) => (
    <div style={{ marginBottom: 16 }}>
      <label style={ls}>{label}</label>
      <input type={type} required={req} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} style={is} />
    </div>
  );

  return (
    <>
      <Helmet><title>إتمام الشراء — ABC الحاوي</title></Helmet>
      <h1 style={{ color: '#1a3a5c', marginBottom: 24 }}>{t('checkout')}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32, alignItems: 'start' }}>
        <form onSubmit={submit}>
          <div style={sec}><h3 style={secT}>📋 بيانات التواصل</h3>{F('customerName', t('yourName'))}{F('customerEmail', t('yourEmail'), 'email')}{F('customerPhone', t('yourPhone'), 'tel')}</div>
          <div style={sec}>
            <h3 style={secT}>🚚 عنوان الشحن</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={ls}>{t('governorate')}</label>
              <select required value={form.governorate} onChange={e => setForm({ ...form, governorate: e.target.value })} style={is}>
                <option value="">اختر المحافظة</option>
                {zones.map(z => <option key={z._id} value={z.governorate.ar}>{z.governorate.ar}</option>)}
              </select>
              {zone && <p style={{ fontSize: 13, color: '#27ae60', marginTop: 6 }}>🚚 رسوم الشحن: {zone.price} ج.م | التوصيل: {zone.estimatedDays.min}–{zone.estimatedDays.max} أيام</p>}
            </div>
            {F('city', t('city'))}{F('street', t('street'))}{F('building', t('building'), 'text', false)}
          </div>
          <div style={sec}>
            <h3 style={secT}>💳 {t('paymentMethod')}</h3>
            {[{ v: 'cod', l: `💵 ${t('cod')}` }, { v: 'instapay', l: `📱 ${t('instapay')}` }, { v: 'card', l: `💳 ${t('card')}` }].map(m => (
              <label key={m.v} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer' }}>
                <input type="radio" name="pay" value={m.v} checked={pay === m.v} onChange={() => setPay(m.v)} />
                <span style={{ fontWeight: 500 }}>{m.l}</span>
              </label>
            ))}
            {pay === 'instapay' && (
              <div style={{ background: '#f0f8ff', borderRadius: 10, padding: 16, marginTop: 8 }}>
                <p style={{ margin: '0 0 12px', fontSize: 14, color: '#1a3a5c' }}>📲 حول <strong>{total.toFixed(0)} ج.م</strong> على InstaPay</p>
                {F('instapayTransactionId', t('transactionId'))}
                <div><label style={ls}>{t('uploadScreenshot')}</label><input type="file" accept="image/*" onChange={e => setSs(e.target.files[0])} style={{ ...is, padding: 8 }} /></div>
              </div>
            )}
            {pay === 'card' && <div style={{ background: '#f0f8ff', borderRadius: 10, padding: 16, marginTop: 8 }}><p style={{ fontSize: 14, color: '#555', margin: 0 }}>ستنتقل إلى بوابة Paymob الآمنة.</p></div>}
          </div>
          <button type="submit" disabled={busy} style={{ width: '100%', padding: 16, background: busy ? '#aaa' : '#1a3a5c', color: '#fff', border: 'none', borderRadius: 10, fontSize: 17, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer' }}>
            {busy ? 'جاري المعالجة...' : t('placeOrder')}
          </button>
        </form>
        <div style={{ position: 'sticky', top: 90 }}>
          <div style={sec}>
            <h3 style={secT}>🛒 ملخص الطلب</h3>
            {cart?.map(item => { const name = item.name?.[lang] || item.name?.ar || ''; const price = item.sellingPrice * (1 - (item.discount || 0) / 100); return (<div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}><span style={{ flex: 1 }}>{name} × {item.qty}</span><strong>{(price * item.qty).toFixed(0)} ج.م</strong></div>); })}
            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span>{t('subtotal')}</span><span>{subtotal.toFixed(0)} ج.م</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><span>{t('shippingFee')}</span><span>{zone ? `${zone.price} ج.م` : '—'}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18 }}><span>{t('total')}</span><span style={{ color: '#1a3a5c' }}>{total.toFixed(0)} ج.م</span></div>
            <p style={{ fontSize: 12, color: '#888', marginTop: 12, textAlign: 'center' }}>{t('returnPolicy')}</p>
          </div>
        </div>
      </div>
    </>
  );
}
const sec = { background: '#fff', borderRadius: 12, padding: 20, marginBottom: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f0e8e8' };
const secT = { margin: '0 0 16px', color: '#1a3a5c', fontSize: 17 };
const is = { width: '100%', padding: '11px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', background: '#fafafa' };
const ls = { display: 'block', marginBottom: 6, fontWeight: 600, color: '#555', fontSize: 14 };
