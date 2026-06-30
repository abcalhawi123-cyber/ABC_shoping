import { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../../api';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import { useLang } from '../../context/LangContext';

const BG = '#6D1A36';

export default function AdminCategories() {
  const { t, lang } = useLang();
  const [cats, setCats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ nameAr: '', nameEn: '' });
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    getCategories().then(r => setCats(r.data.data)).catch(() => toast.error('فشل')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditId(null); setForm({ nameAr: '', nameEn: '' }); setShowForm(true); };
  const openEdit = c => { setEditId(c._id); setForm({ nameAr: c.name.ar, nameEn: c.name.en }); setShowForm(true); };

  const submit = async e => {
    e.preventDefault();
    if (!form.nameAr.trim() || !form.nameEn.trim()) return toast.error(lang === 'ar' ? 'أدخل الاسمين' : 'Enter both names');
    setBusy(true);
    try {
      if (editId) { await updateCategory(editId, { nameAr: form.nameAr, nameEn: form.nameEn }); toast.success(lang === 'ar' ? 'تم التحديث ✓' : 'Updated ✓'); }
      else { await createCategory({ nameAr: form.nameAr, nameEn: form.nameEn }); toast.success(lang === 'ar' ? 'تمت الإضافة ✓' : 'Added ✓'); }
      setShowForm(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'خطأ'); }
    setBusy(false);
  };

  const del = async (id, name) => {
    if (!window.confirm(`${lang === 'ar' ? 'حذف' : 'Delete'} "${name}"?`)) return;
    try { await deleteCategory(id); toast.success(lang === 'ar' ? 'تم الحذف' : 'Deleted'); load(); }
    catch { toast.error(lang === 'ar' ? 'فشل الحذف' : 'Delete failed'); }
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: BG }}>🏷️ {t('adminCategories')}</h2>
        <button onClick={openAdd} style={{ padding: '10px 20px', background: BG, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
          + {lang === 'ar' ? 'إضافة صنف' : 'Add Category'}
        </button>
      </div>

      <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>
        💡 {lang === 'ar' ? 'الأصناف المضافة هنا ستظهر في القائمة المنسدلة في الهيدر للعملاء' : 'Categories added here appear in the header dropdown for customers'}
      </p>

      {/* Form */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: `1px solid ${BG}20` }}>
          <h3 style={{ margin: '0 0 18px', color: BG }}>{editId ? (lang === 'ar' ? '✏️ تعديل الصنف' : '✏️ Edit Category') : (lang === 'ar' ? '➕ إضافة صنف جديد' : '➕ Add New Category')}</h3>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
              <div>
                <label style={ls}>{lang === 'ar' ? 'اسم الصنف (عربي)' : 'Category Name (AR)'}</label>
                <input required value={form.nameAr} onChange={e => setForm({ ...form, nameAr: e.target.value })} placeholder={lang === 'ar' ? 'مثل: ألعاب قطنية' : 'e.g. ألعاب قطنية'} style={is} />
              </div>
              <div>
                <label style={ls}>Category Name (EN)</label>
                <input required value={form.nameEn} onChange={e => setForm({ ...form, nameEn: e.target.value })} placeholder="e.g. Plush Toys" style={is} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={busy} style={{ padding: '11px 24px', background: busy ? '#ccc' : BG, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer', fontSize: 14 }}>
                {busy ? '...' : t('save')}
              </button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '11px 18px', background: '#f5f5f5', color: '#555', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
                {t('cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories list */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>{t('loading')}</div>
      ) : cats.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: '40px', textAlign: 'center', color: '#aaa' }}>
          <p style={{ fontSize: 48 }}>🏷️</p>
          <p>{lang === 'ar' ? 'لا توجد أصناف بعد' : 'No categories yet'}</p>
          {/* Seed default categories */}
          <button onClick={async () => {
            const defaults = [
              { nameAr: 'ألعاب قطنية', nameEn: 'Plush Toys' },
              { nameAr: 'شنط أطفال', nameEn: 'Kids Bags' },
            ];
            for (const d of defaults) { try { await createCategory(d); } catch {} }
            toast.success(lang === 'ar' ? 'تمت إضافة الأصناف الافتراضية' : 'Default categories added');
            load();
          }} style={{ padding: '11px 24px', background: BG, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14, marginTop: 12 }}>
            {lang === 'ar' ? '🚀 إضافة الأصناف الافتراضية' : '🚀 Add Default Categories'}
          </button>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#fdf5f7' }}>
                {['الاسم (عربي)', 'Name (EN)', 'الحالة', 'إجراءات'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, borderBottom: `2px solid ${BG}20`, color: BG }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cats.map(c => (
                <tr key={c._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 600, color: '#1a1a1a' }}>{c.name.ar}</td>
                  <td style={{ padding: '14px 16px', color: '#555' }}>{c.name.en}</td>
                  <td style={{ padding: '14px 16px' }}>
                    <span style={{ background: c.isActive ? '#e8f5e9' : '#ffebee', color: c.isActive ? '#27ae60' : '#c62828', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
                      {c.isActive ? (lang === 'ar' ? 'نشط' : 'Active') : (lang === 'ar' ? 'معطل' : 'Inactive')}
                    </span>
                  </td>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(c)} style={{ padding: '6px 12px', background: '#e3f2fd', color: '#1565c0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                        ✏️ {t('edit')}
                      </button>
                      <button onClick={() => del(c._id, c.name.ar)} style={{ padding: '6px 12px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>
                        🗑 {t('delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}

const ls = { display: 'block', marginBottom: 6, fontWeight: 600, color: '#555', fontSize: 13 };
const is = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fafafa', boxSizing: 'border-box' };
