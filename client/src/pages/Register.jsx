import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

// Password strength checker
const checkPassword = (pass) => {
  const checks = [
    { test: pass.length >= 8, msg: '8 أحرف على الأقل' },
    { test: /[a-zA-Z]/.test(pass), msg: 'حروف' },
    { test: /[0-9]/.test(pass), msg: 'أرقام' },
    { test: /[^a-zA-Z0-9]/.test(pass), msg: 'علامة خاصة (@#$...)' },
  ];
  return checks;
};

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const passChecks = checkPassword(form.password);
  const passStrong = passChecks.every(c => c.test);

  const submit = async e => {
    e.preventDefault();
    if (!passStrong) return toast.error('كلمة المرور ضعيفة — اتبع الشروط المطلوبة');
    setBusy(true);
    try {
      const { data } = await register(form);
      loginUser(data.user, data.token);
      toast.success('تم إنشاء حسابك ✓');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ، حاول مرة أخرى');
    }
    setBusy(false);
  };

  return (
    <div style={{ maxWidth: 440, margin: '40px auto' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#1a3a5c', textAlign: 'center', marginBottom: 28 }}>إنشاء حساب جديد</h2>
        <form onSubmit={submit}>

          {/* Name */}
          <div style={{ marginBottom: 16 }}>
            <label style={ls}>الاسم الكامل</label>
            <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={is} placeholder="مثل: أحمد محمد" />
          </div>

          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label style={ls}>البريد الإلكتروني</label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={is} placeholder="example@email.com" />
          </div>

          {/* Phone */}
          <div style={{ marginBottom: 16 }}>
            <label style={ls}>رقم الهاتف</label>
            <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} style={is} placeholder="01xxxxxxxxx" />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 8 }}>
            <label style={ls}>كلمة المرور</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                style={{ ...is, paddingLeft: 44 }}
                placeholder="أدخل كلمة مرور قوية"
              />
              <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#888' }}>
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Password strength indicators */}
          {form.password.length > 0 && (
            <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: '#555' }}>متطلبات كلمة المرور:</p>
              {passChecks.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: c.test ? '#27ae60' : '#e74c3c' }}>{c.test ? '✓' : '✗'}</span>
                  <span style={{ fontSize: 12, color: c.test ? '#27ae60' : '#e74c3c' }}>{c.msg}</span>
                </div>
              ))}
            </div>
          )}

          <button type="submit" disabled={busy || !passStrong} style={{ ...bs, opacity: busy || !passStrong ? 0.7 : 1, cursor: busy || !passStrong ? 'not-allowed' : 'pointer' }}>
            {busy ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#888' }}>
          عندك حساب؟ <Link to="/login" style={{ color: '#f8ad9d', fontWeight: 600 }}>سجل الدخول</Link>
        </p>
      </div>
    </div>
  );
}

const ls = { display: 'block', marginBottom: 6, fontWeight: 600, color: '#555', fontSize: 14 };
const is = { width: '100%', padding: '11px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fafafa', boxSizing: 'border-box' };
const bs = { width: '100%', padding: 13, background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, marginTop: 8 };
