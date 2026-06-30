import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LangContext';
import toast from 'react-hot-toast';

const AP = import.meta.env.VITE_ADMIN_PATH || 'admin-panel';
const BG = '#6D1A36';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '', adminKey: '' });
  const [busy, setBusy] = useState(false);
  const { loginUser } = useAuth();
  const { brand, lang } = useLang();
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault(); setBusy(true);
    try {
      const { data } = await adminLogin(form);
      loginUser(data.user, data.token);
      toast.success(lang === 'ar' ? 'أهلاً في لوحة التحكم' : 'Welcome to Admin Panel');
      navigate(`/${AP}/dashboard`);
    } catch (err) { toast.error(err.response?.data?.message || (lang === 'ar' ? 'بيانات غير صحيحة' : 'Invalid credentials')); }
    setBusy(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f4f0f1', display: 'flex', alignItems: 'center', justifyContent: 'center', direction: 'rtl', padding: 20 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 420, boxShadow: '0 8px 32px rgba(109,26,54,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ width: 60, height: 60, background: BG, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', fontSize: 24 }}>🔐</div>
          <h1 style={{ color: BG, margin: '0 0 4px', fontSize: 26, fontWeight: 800, letterSpacing: 1 }}>{brand}</h1>
          <p style={{ color: '#888', margin: 0, fontSize: 14 }}>Admin Panel</p>
        </div>
        <form onSubmit={submit}>
          {[
            { k: 'email', l: lang === 'ar' ? 'البريد الإلكتروني' : 'Email', t: 'email' },
            { k: 'password', l: lang === 'ar' ? 'كلمة المرور' : 'Password', t: 'password' },
            { k: 'adminKey', l: `🔑 ${lang === 'ar' ? 'مفتاح المشرف' : 'Admin Key'}`, t: 'password' },
          ].map(f => (
            <div key={f.k} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#555', fontSize: 14 }}>{f.l}</label>
              <input type={f.t} required value={form[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })}
                style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', background: '#fafafa', outline: 'none' }} />
            </div>
          ))}
          <button type="submit" disabled={busy}
            style={{ width: '100%', padding: 14, background: busy ? '#ccc' : BG, color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer', marginTop: 8 }}>
            {busy ? '...' : (lang === 'ar' ? 'تسجيل الدخول' : 'Login')}
          </button>
        </form>
      </div>
    </div>
  );
}
