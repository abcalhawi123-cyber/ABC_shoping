import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [busy, setBusy] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();
  const submit = async e => {
    e.preventDefault(); setBusy(true);
    try { const { data } = await login(form); loginUser(data.user, data.token); toast.success('أهلاً بك!'); navigate('/'); }
    catch (err) { toast.error(err.response?.data?.message || 'بيانات غير صحيحة'); }
    setBusy(false);
  };
  return (
    <div style={{ maxWidth: 420, margin: '40px auto' }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 36, boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
        <h2 style={{ color: '#1a3a5c', textAlign: 'center', marginBottom: 28 }}>تسجيل الدخول</h2>
        <form onSubmit={submit}>
          {[{ k: 'email', l: 'البريد الإلكتروني', t: 'email' }, { k: 'password', l: 'كلمة المرور', t: 'password' }].map(f => (
            <div key={f.k} style={{ marginBottom: 16 }}>
              <label style={ls}>{f.l}</label>
              <input type={f.t} required value={form[f.k]} onChange={e => setForm({ ...form, [f.k]: e.target.value })} style={is} />
            </div>
          ))}
          <button type="submit" disabled={busy} style={bs}>{busy ? '...' : 'دخول'}</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#888' }}>مش عندك حساب؟ <Link to="/register" style={{ color: '#f8ad9d', fontWeight: 600 }}>سجل الآن</Link></p>
        <p style={{ textAlign: 'center', marginTop: 8, fontSize: 13, color: '#aaa' }}>أو <Link to="/checkout" style={{ color: '#1a3a5c' }}>تسوق كزائر</Link></p>
      </div>
    </div>
  );
}
const ls = { display: 'block', marginBottom: 6, fontWeight: 600, color: '#555', fontSize: 14 };
const is = { width: '100%', padding: '11px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fafafa', boxSizing: 'border-box' };
const bs = { width: '100%', padding: 13, background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: 'pointer', marginTop: 8 };
