import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { register } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const checkPassword = pass => [
  { test: pass.length >= 8, ar: '8 أحرف على الأقل', en: 'At least 8 characters' },
  { test: /[a-zA-Z]/.test(pass), ar: 'يحتوي على حروف', en: 'Contains letters' },
  { test: /[0-9]/.test(pass), ar: 'يحتوي على أرقام', en: 'Contains numbers' },
  { test: /[^a-zA-Z0-9]/.test(pass), ar: 'يحتوي على علامة خاصة (@#$...)', en: 'Contains special character (@#$...)' },
];

export default function Register() {
  const { lang, t } = useLang();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const checks = checkPassword(form.password);
  const strong = checks.every(c => c.test);

  const submit = async e => {
    e.preventDefault();
    if (!strong) return toast.error(lang === 'ar' ? 'كلمة المرور ضعيفة' : 'Password is too weak');
    setBusy(true);
    try {
      const { data } = await register(form);
      loginUser(data.user, data.token);
      toast.success(lang === 'ar' ? 'تم إنشاء حسابك ✓' : 'Account created ✓');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || (lang === 'ar' ? 'حدث خطأ' : 'An error occurred'));
    }
    setBusy(false);
  };

  return (
    <div style={{ maxWidth: 440, margin: '40px auto' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#1a3a5c', textAlign: 'center', marginBottom: 28 }}>
          {lang === 'ar' ? 'إنشاء حساب جديد' : 'Create Account'}
        </h2>
        <form onSubmit={submit}>
          {[
            { k: 'name', l: lang === 'ar' ? 'الاسم الكامل' : 'Full Name', t: 'text', p: lang === 'ar' ? 'مثل: أحمد محمد' : 'e.g. John Smith' },
            { k: 'email', l: lang === 'ar' ? 'البريد الإلكتروني' : 'Email', t: 'email', p: 'example@email.com' },
            { k: 'phone', l: lang === 'ar' ? 'رقم الهاتف' : 'Phone Number', t: 'tel', p: '01xxxxxxxxx' },
          ].map(f => (
            <div key={f.k} style={{ marginBottom: 16 }}>
              <label style={ls}>{f.l}</label>
              <input type={f.t} required value={form[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} placeholder={f.p} style={is} />
            </div>
          ))}

          {/* Password with strength meter */}
          <div style={{ marginBottom: 8 }}>
            <label style={ls}>{lang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                required
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder={lang === 'ar' ? 'أدخل كلمة مرور قوية' : 'Enter a strong password'}
                style={{ ...is, paddingLeft: 44 }}
              />
              <button type="button" onClick={() => setShowPass(s => !s)} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>
                {showPass ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Password strength */}
          {form.password.length > 0 && (
            <div style={{ background: '#f8f9fa', borderRadius: 8, padding: '10px 14px', marginBottom: 16 }}>
              <p style={{ margin: '0 0 8px', fontSize: 12, fontWeight: 600, color: '#555' }}>
                {lang === 'ar' ? 'متطلبات كلمة المرور:' : 'Password requirements:'}
              </p>
              {checks.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: c.test ? '#27ae60' : '#e74c3c' }}>{c.test ? '✓' : '✗'}</span>
                  <span style={{ fontSize: 12, color: c.test ? '#27ae60' : '#e74c3c' }}>{lang === 'ar' ? c.ar : c.en}</span>
                </div>
              ))}
            </div>
          )}

          <button type="submit" disabled={busy || !strong} style={{ ...bs, opacity: busy || !strong ? 0.7 : 1, cursor: busy || !strong ? 'not-allowed' : 'pointer' }}>
            {busy ? '...' : lang === 'ar' ? 'إنشاء الحساب' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#888' }}>
          {lang === 'ar' ? 'عندك حساب؟' : 'Already have an account?'}{' '}
          <Link to="/login" style={{ color: '#f8ad9d', fontWeight: 600 }}>
            {lang === 'ar' ? 'سجل الدخول' : 'Login'}
          </Link>
        </p>
      </div>
    </div>
  );
}

const ls = { display: 'block', marginBottom: 6, fontWeight: 600, color: '#555', fontSize: 14 };
const is = { width: '100%', padding: '11px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fafafa', boxSizing: 'border-box' };
const bs = { width: '100%', padding: 13, background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, marginTop: 8 };
