import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const AP = import.meta.env.VITE_ADMIN_PATH || 'admin-panel';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '', adminKey: '' });
  const [busy, setBusy] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const submit = async e => {
    e.preventDefault(); setBusy(true);
    try { const { data } = await adminLogin(form); loginUser(data.user, data.token); toast.success('أهلاً في لوحة التحكم'); navigate(`/${AP}/dashboard`); }
    catch (err) { toast.error(err.response?.data?.message || 'بيانات غير صحيحة'); }
    setBusy(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center', direction: 'rtl' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: '40px 36px', width: '100%', maxWidth: 420, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ color: '#1a3a5c', margin: '0 0 4px', fontSize: 28 }}>ABC الحاوي</h1>
          <p style={{ color: '#888', margin: 0, fontSize: 14 }}>لوحة تحكم الإدارة</p>
        </div>
        <form onSubmit={submit}>
          {[
            { k: 'email', l: 'البريد الإلكتروني', t: 'email' },
            { k: 'password', l: 'كلمة المرور', t: 'password' },
            { k: 'adminKey', l: '🔑 مفتاح المشرف', t: 'password' },
          ].map(f => (
            <div key={f.k} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#555', fontSize: 14 }}>{f.l}</label>
              <input type={f.t} required value={form[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 14, boxSizing: 'border-box', background: '#fafafa' }} />
            </div>
          ))}
          <button type="submit" disabled={busy} style={{ width: '100%', padding: 14, background: busy ? '#aaa' : '#1a3a5c', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer', marginTop: 8 }}>
            {busy ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
