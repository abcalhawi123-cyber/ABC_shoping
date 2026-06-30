import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { lang, t } = useLang();
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await login(form);
      loginUser(data.user, data.token);
      toast.success(lang === 'ar' ? 'أهلاً بك!' : 'Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || (lang === 'ar' ? 'بيانات غير صحيحة' : 'Invalid credentials'));
    }
    setBusy(false);
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#6D1A36', textAlign: 'center', marginBottom: 28 }}>
          {lang === 'ar' ? 'تسجيل الدخول' : 'Login'}
        </h2>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 16 }}>
            <label style={ls}>{t('yourEmail')}</label>
            <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={is} placeholder="example@email.com" />
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={ls}>{lang === 'ar' ? 'كلمة المرور' : 'Password'}</label>
            <input type="password" required value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={is} />
          </div>
          <button type="submit" disabled={busy} style={bs}>
            {busy ? '...' : lang === 'ar' ? 'دخول' : 'Login'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#888' }}>
          {lang === 'ar' ? 'مش عندك حساب؟' : "Don't have an account?"}{' '}
          <Link to="/register" style={{ color: '#f8ad9d', fontWeight: 600 }}>
            {lang === 'ar' ? 'سجل الآن' : 'Register'}
          </Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: '#aaa' }}>
          {lang === 'ar' ? 'أو' : 'or'}{' '}
          <Link to="/checkout" style={{ color: '#6D1A36' }}>
            {lang === 'ar' ? 'تسوق كزائر بدون حساب' : 'checkout as guest'}
          </Link>
        </p>
      </div>
    </div>
  );
}
const ls = { display: 'block', marginBottom: 6, fontWeight: 600, color: '#555', fontSize: 14 };
const is = { width: '100%', padding: '11px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fafafa', boxSizing: 'border-box' };
const bs = { width: '100%', padding: 13, background: '#6D1A36', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8 };
