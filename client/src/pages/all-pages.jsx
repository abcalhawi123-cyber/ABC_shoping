// ---- OrderConfirmation.jsx ----
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../api';

export function OrderConfirmation() {
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
          <p style={{ margin: 0, color: '#ef6c00', fontSize: 14 }}>
            ⏳ طلبك قيد المراجعة — سنتحقق من تحويل InstaPay وسنبدأ التجهيز قريباً.
          </p>
        </div>
      )}

      <p style={{ fontSize: 13, color: '#aaa', marginBottom: 24 }}>🔄 سياسة الإرجاع: 15 يوم من تاريخ الطلب</p>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Link to={`/track/${id}`} style={{ padding: '12px 24px', background: '#1a3a5c', color: '#fff', textDecoration: 'none', borderRadius: 8, fontWeight: 600 }}>
          تتبع الطلب
        </Link>
        <Link to="/" style={{ padding: '12px 24px', background: '#f5f5f5', color: '#555', textDecoration: 'none', borderRadius: 8, fontWeight: 600 }}>
          الرئيسية
        </Link>
      </div>
    </div>
  );
}

// ---- OrderTrack.jsx ----
import { getOrder as fetchOrder } from '../api';

export function OrderTrack() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder(id).then(r => { setOrder(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const STEPS = ['قيد المراجعة', 'جاري التجهيز', 'تم الشحن', 'تم التسليم'];
  const currentStep = STEPS.indexOf(order?.status);

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '20px 0' }}>
      <h1 style={{ color: '#1a3a5c', marginBottom: 8 }}>📦 تتبع الطلب</h1>
      <p style={{ color: '#888', marginBottom: 28 }}>رقم الطلب: {id}</p>

      {loading ? <p>جاري التحميل...</p> : !order ? <p>الطلب غير موجود</p> : (
        <>
          {/* Progress steps */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 16, right: '8%', left: '8%', height: 3, background: '#f0f2f5', zIndex: 0 }}>
              <div style={{ width: `${Math.max(0, currentStep / (STEPS.length - 1)) * 100}%`, height: '100%', background: '#1a3a5c', transition: 'width 0.5s' }} />
            </div>
            {STEPS.map((step, i) => (
              <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, flex: 1 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: i <= currentStep ? '#1a3a5c' : '#f0f2f5',
                  color: i <= currentStep ? '#fff' : '#aaa',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 14, marginBottom: 8,
                  border: i === currentStep ? '3px solid #f8ad9d' : '3px solid transparent',
                }}>
                  {i < currentStep ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 12, color: i <= currentStep ? '#1a3a5c' : '#aaa', fontWeight: i === currentStep ? 700 : 400, textAlign: 'center' }}>
                  {step}
                </span>
              </div>
            ))}
          </div>

          {order.status === 'مرتجع' && (
            <div style={{ background: '#ffebee', borderRadius: 10, padding: '14px 18px', marginBottom: 20, color: '#c62828', fontWeight: 600 }}>
              🔄 تم تسجيل الإرجاع — سيتم استرداد المبلغ قريباً.
            </div>
          )}

          {/* Order info */}
          <div style={{ background: '#fff', borderRadius: 12, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <h3 style={{ color: '#1a3a5c', margin: '0 0 14px' }}>تفاصيل الطلب</h3>
            {order.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                <span>{item.name?.ar} × {item.quantity}</span>
                <span>{(item.unitPrice * item.quantity).toFixed(0)} ج.م</span>
              </div>
            ))}
            <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '12px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
              <span>الإجمالي</span><span style={{ color: '#1a3a5c' }}>{order.total} ج.م</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ---- Login.jsx ----
import { useState as useStateLogin } from 'react';
import { useNavigate as useNavLogin } from 'react-router-dom';
import { login } from '../api';
import { useAuth as useAuthLogin } from '../context/AuthContext';
import toast from 'react-hot-toast';

export function Login() {
  const [form, setForm] = useStateLogin({ email: '', password: '' });
  const [loading, setLoading] = useStateLogin(false);
  const { loginUser } = useAuthLogin();
  const navigate = useNavLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form);
      loginUser(data.user, data.token);
      toast.success('أهلاً بك!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'بيانات غير صحيحة');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '36px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#1a3a5c', textAlign: 'center', marginBottom: 28 }}>تسجيل الدخول</h2>
        <form onSubmit={handleSubmit}>
          {[
            { key: 'email', label: 'البريد الإلكتروني', type: 'email' },
            { key: 'password', label: 'كلمة المرور', type: 'password' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={ls}>{f.label}</label>
              <input type={f.type} required value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={is} />
            </div>
          ))}
          <button type="submit" disabled={loading} style={bs}>{loading ? '...' : 'دخول'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#888' }}>
          مش عندك حساب؟ <Link to="/register" style={{ color: '#f8ad9d', fontWeight: 600 }}>سجل الآن</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: '#aaa' }}>
          أو <Link to="/checkout" style={{ color: '#1a3a5c' }}>تسوق كزائر</Link>
        </p>
      </div>
    </div>
  );
}

// ---- Register.jsx ----
import { useState as useStateReg } from 'react';
import { useNavigate as useNavReg, Link as LinkReg } from 'react-router-dom';
import { register } from '../api';
import { useAuth as useAuthReg } from '../context/AuthContext';

export function Register() {
  const [form, setForm] = useStateReg({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useStateReg(false);
  const { loginUser } = useAuthReg();
  const navigate = useNavReg();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await register(form);
      loginUser(data.user, data.token);
      toast.success('تم إنشاء حسابك ✓');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '36px', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#1a3a5c', textAlign: 'center', marginBottom: 28 }}>إنشاء حساب</h2>
        <form onSubmit={handleSubmit}>
          {[
            { key: 'name', label: 'الاسم', type: 'text' },
            { key: 'email', label: 'البريد الإلكتروني', type: 'email' },
            { key: 'phone', label: 'رقم الهاتف', type: 'tel' },
            { key: 'password', label: 'كلمة المرور (8 أحرف على الأقل)', type: 'password' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={ls}>{f.label}</label>
              <input type={f.type} required value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} style={is} />
            </div>
          ))}
          <button type="submit" disabled={loading} style={bs}>{loading ? '...' : 'إنشاء الحساب'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#888' }}>
          عندك حساب؟ <LinkReg to="/login" style={{ color: '#f8ad9d', fontWeight: 600 }}>سجل الدخول</LinkReg>
        </p>
      </div>
    </div>
  );
}

const ls = { display: 'block', marginBottom: 6, fontWeight: 600, color: '#555', fontSize: 14 };
const is = { width: '100%', padding: '11px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fafafa', boxSizing: 'border-box' };
const bs = { width: '100%', padding: '13px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8 };
