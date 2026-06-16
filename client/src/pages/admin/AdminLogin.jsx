import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../../api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const ADMIN_PATH = import.meta.env.VITE_ADMIN_PATH || 'admin-panel';

export default function AdminLogin() {
  const [form, setForm] = useState({ email: '', password: '', adminKey: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await adminLogin(form);
      loginUser(data.user, data.token);
      toast.success('أهلاً بك في لوحة التحكم');
      navigate(`/${ADMIN_PATH}/dashboard`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'بيانات غير صحيحة');
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#f0f2f5',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      direction: 'rtl',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: '40px 36px',
        width: '100%', maxWidth: 420,
        boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <h1 style={{ color: '#1a3a5c', margin: '0 0 4px', fontSize: 28 }}>ABC الحاوي</h1>
          <p style={{ color: '#888', margin: 0, fontSize: 14 }}>لوحة تحكم الإدارة</p>
        </div>

        <form onSubmit={handleSubmit}>
          {[
            { key: 'email', label: 'البريد الإلكتروني', type: 'email' },
            { key: 'password', label: 'كلمة المرور', type: 'password' },
            { key: 'adminKey', label: '🔑 مفتاح المشرف', type: 'password' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#555', fontSize: 14 }}>
                {f.label}
              </label>
              <input
                type={f.type}
                required
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                style={{
                  width: '100%', padding: '12px', border: '1px solid #ddd',
                  borderRadius: 8, fontSize: 14, boxSizing: 'border-box',
                  background: '#fafafa',
                }}
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading ? '#aaa' : '#1a3a5c',
              color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 8,
            }}
          >
            {loading ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
