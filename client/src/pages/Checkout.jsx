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
  const [selectedZone, setSelectedZone] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [screenshot, setScreenshot] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customerName: user?.name || '', customerEmail: user?.email || '',
    customerPhone: user?.phone || '', governorate: '', city: '',
    street: '', building: '', instapayTransactionId: '',
  });

  useEffect(() => { getShippingZones().then(r => setZones(r.data.data)).catch(() => {}); }, []);
  useEffect(() => {
    if (form.governorate) {
      const zone = zones.find(z => z.governorate.ar === form.governorate || z.governorate.en === form.governorate);
      setSelectedZone(zone || null);
    }
  }, [form.governorate, zones]);

  const total = subtotal + (selectedZone?.price || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!cart || cart.length === 0) return toast.error('السلة فارغة');
    if (!selectedZone) return toast.error('اختر المحافظة أولاً');
    if (paymentMethod === 'instapay' && !form.instapayTransactionId) return toast.error('أدخل كود العملية');
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('paymentMethod', paymentMethod);
      fd.append('items', JSON.stringify(cart.map(i => ({ productId: i._id, quantity: i.qty }))));
      if (user?._id) fd.append('userId', user._id);
      if (screenshot) fd.append('instapayScreenshot', screenshot);
      const { data } = await placeOrder(fd);
      dispatch({ type: 'CLEAR' });
      navigate(`/order-confirmation/${data.data.orderId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ، حاول مرة أخرى');
    }
    setSubmitting(false);
  };

  const field = (name, label, type = 'text', required = true) => (
    <div style={{ marginBottom: 16 }}>
      <label style={ls}>{label}</label>
      <input type={type} required={required} value={form[name]} onChange={e => setForm({ ...form, [name]: e.target.value })} style={is} />
    </div>
  );

  return (
    <>
      <Helmet><title>إتمام الشراء — ABC الحاوي</title></Helmet>
      <h1 style={{ color: '#1a3a5c', marginBottom: 24 }}>{t('checkout')}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
        <form onSubmit={handleSubmit}>
          <div style={sec}>
            <h3 style={secT}>📋 بيانات التواصل</h3>
            {field('customerName', t('yourName'))}
            {field('customerEmail', t('yourEmail'), 'email')}
            {field('customerPhone', t('yourPhone'), 'tel')}
          </div>
          <div style={sec}>
            <h3 style={secT}>🚚 عنوان الشحن</h3>
            <div style={{ marginBottom: 16 }}>
              <label style={ls}>{t('governorate')}</label>
              <select required value={form.governorate} onChange={e => setForm({ ...form, governorate: e.target.value })} style={is}>
                <option value="">اختر المحافظة</option>
                {zones.map(z => <option key={z._id} value={z.governorate.ar}>{z.governorate.ar}</option>)}
              </select>
              {selectedZone && <p style={{ fontSize: 13, color: '#27ae60', marginTop: 6 }}>🚚 رسوم الشحن: {selectedZone.price} ج.م | التوصيل: {selectedZone.estimatedDays.min}–{selectedZone.estimatedDays.max} أيام</p>}
            </div>
            {field('city', t('city'))}
            {field('street', t('street'))}
            {field('building', t('building'), 'text', false)}
          </div>
          <div style={sec}>
            <h3 style={secT}>💳 طريقة الدفع</h3>
            {[{ value: 'cod', label: `💵 ${t('cod')}` }, { value: 'instapay', label: `📱 ${t('instapay')}` }, { value: 'card', label: `💳 ${t('card')}` }].map(m => (
              <label key={m.value} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer' }}>
                <input type="radio" name="payment" value={m.value} checked={paymentMethod === m.value} onChange={() => setPaymentMethod(m.value)} />
                <span style={{ fontWeight: 500 }}>{m.label}</span>
              </label>
            ))}
            {paymentMethod === 'instapay' && (
              <div style={{ background: '#f0f8ff', borderRadius: 10, padding: 16, marginTop: 8 }}>
                <p style={{ margin: '0 0 12px', fontSize: 14, color: '#1a3a5c' }}>📲 حول المبلغ <strong>{total.toFixed(0)} ج.م</strong> على InstaPay</p>
                {field('instapayTransactionId', t('transactionId'))}
                <div>
                  <label style={ls}>{t('uploadScreenshot')}</label>
                  <input type="file" accept="image/*" onChange={e => setScreenshot(e.target.files[0])} style={{ ...is, padding: 8 }} />
                </div>
              </div>
            )}
            {paymentMethod === 'card' && (
              <div style={{ background: '#f0f8ff', borderRadius: 10, padding: 16, marginTop: 8 }}>
                <p style={{ fontSize: 14, color: '#555', margin: 0 }}>ستنتقل إلى بوابة Paymob الآمنة لإتمام الدفع.</p>
              </div>
            )}
          </div>
          <button type="submit" disabled={submitting} style={{ width: '100%', padding: '16px', background: submitting ? '#aaa' : '#1a3a5c', color: '#fff', border: 'none', borderRadius: 10, fontSize: 17, fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer' }}>
            {submitting ? 'جاري المعالجة...' : t('placeOrder')}
          </button>
        </form>
        <div style={{ position: 'sticky', top: 90 }}>
          <div style={sec}>
            <h3 style={secT}>🛒 ملخص الطلب</h3>
            {cart && cart.map(item => {
              const name = item.name?.[lang] || item.name?.ar;
              const price = item.sellingPrice * (1 - (item.discount || 0) / 100);
              return (
                <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 }}>
                  <span style={{ flex: 1 }}>{name} × {item.qty}</span>
                  <strong>{(price * item.qty).toFixed(0)} ج.م</strong>
                </div>
              );
            })}
            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}><span>{t('subtotal')}</span><span>{subtotal.toFixed(0)} ج.م</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}><span>{t('shippingFee')}</span><span>{selectedZone ? `${selectedZone.price} ج.م` : '—'}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18 }}><span>{t('total')}</span><span style={{ color: '#1a3a5c' }}>{total.toFixed(0)} ج.م</span></div>
            <p style={{ fontSize: 12, color: '#888', marginTop: 12, textAlign: 'center' }}>{t('returnPolicy')}</p>
          </div>
        </div>
      </div>
    </>
  );
}

const sec = { background: '#fff', borderRadius: 12, padding: '20px', marginBottom: 20, boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f0e8e8' };
const secT = { margin: '0 0 16px', color: '#1a3a5c', fontSize: 17 };
const is = { width: '100%', padding: '11px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', background: '#fafafa' };
const ls = { display: 'block', marginBottom: 6, fontWeight: 600, color: '#555', fontSize: 14 };
