import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const { loginUser } = useAuth();
  const navigate = useNavigate();

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
        <h2 style={{ color: '#1a3a5c', textAlign: 'center', marginBottom: 28 }}>إنشاء حساب جديد</h2>
        <form onSubmit={handleSubmit}>
          {[
            { key: 'name', label: 'الاسم الكامل', type: 'text' },
            { key: 'email', label: 'البريد الإلكتروني', type: 'email' },
            { key: 'phone', label: 'رقم الهاتف', type: 'tel' },
            { key: 'password', label: 'كلمة المرور (8 أحرف على الأقل)', type: 'password' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#555', fontSize: 14 }}>{f.label}</label>
              <input
                type={f.type}
                required
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                style={{ width: '100%', padding: '11px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fafafa', boxSizing: 'border-box' }}
              />
            </div>
          ))}
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', background: loading ? '#aaa' : '#1a3a5c', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8 }}>
            {loading ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: '#888' }}>
          عندك حساب بالفعل؟ <Link to="/login" style={{ color: '#f8ad9d', fontWeight: 600 }}>سجل الدخول</Link>
        </p>
      </div>
    </div>
  );
}
