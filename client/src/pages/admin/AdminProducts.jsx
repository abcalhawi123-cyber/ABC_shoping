import { useState, useEffect } from 'react';
import { getAdminProducts, createProduct, updateProduct, deleteProduct } from '../../api';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';

const EF = { nameAr:'', nameEn:'', categoryAr:'', categoryEn:'', descriptionAr:'', descriptionEn:'', costPrice:'', sellingPrice:'', discount:'0', stock:'' };

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EF);
  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);

  const load = (page = 1) => { setLoading(true); getAdminProducts({ page }).then(r => { setProducts(r.data.data); setPagination(r.data.pagination); }).catch(() => toast.error('فشل التحميل')).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EF); setImages([]); setShowForm(true); };
  const openEdit = p => { setEditing(p); setForm({ nameAr: p.name?.ar||'', nameEn: p.name?.en||'', categoryAr: p.category?.ar||'', categoryEn: p.category?.en||'', descriptionAr: p.description?.ar||'', descriptionEn: p.description?.en||'', costPrice: p.costPrice||'', sellingPrice: p.sellingPrice||'', discount: p.discount||'0', stock: p.stock||'' }); setImages([]); setShowForm(true); };

  const submit = async e => {
    e.preventDefault(); setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach(img => fd.append('images', img));
      if (editing) { await updateProduct(editing._id, fd); toast.success('تم التحديث ✓'); }
      else { await createProduct(fd); toast.success('تمت الإضافة ✓'); }
      setShowForm(false); load(pagination.page);
    } catch (err) { toast.error(err.response?.data?.message || 'حدث خطأ'); }
    setBusy(false);
  };

  const del = async (id, name) => {
    if (!window.confirm(`حذف "${name}"؟`)) return;
    try { await deleteProduct(id); toast.success('تم الحذف'); load(pagination.page); }
    catch { toast.error('فشل الحذف'); }
  };

  const F = (key, label, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 14 }}>
      <label style={ls}>{label}</label>
      <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={placeholder} style={is} />
    </div>
  );

  const TA = (key, label) => (
    <div style={{ marginBottom: 14 }}>
      <label style={ls}>{label}</label>
      <textarea value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} rows={3} style={{ ...is, resize: 'vertical' }} />
    </div>
  );

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: '#1a3a5c' }}>📦 إدارة المنتجات</h2>
        <button onClick={openAdd} style={btnP}>+ إضافة منتج</button>
      </div>

      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 20, overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, width: '100%', maxWidth: 700, boxShadow: '0 16px 48px rgba(0,0,0,0.2)', marginTop: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ margin: 0, color: '#1a3a5c' }}>{editing ? '✏️ تعديل المنتج' : '➕ إضافة منتج جديد'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>✕</button>
            </div>
            <form onSubmit={submit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>{F('nameAr', 'اسم المنتج (عربي) — اكتبه يدوياً', 'text', 'مثل: دبدوب قطيفة')}</div>
                <div>{F('nameEn', 'Product Name (EN) — type manually', 'text', 'e.g. Plush Teddy Bear')}</div>
                <div>{F('categoryAr', 'الفئة (عربي) — اكتبها يدوياً', 'text', 'مثل: ألعاب قطنية')}</div>
                <div>{F('categoryEn', 'Category (EN) — type manually', 'text', 'e.g. Cotton Toys')}</div>
              </div>
              {TA('descriptionAr', 'الوصف (عربي)')}
              {TA('descriptionEn', 'Description (EN)')}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                <div>{F('costPrice', 'سعر التكلفة', 'number', '0')}</div>
                <div>{F('sellingPrice', 'سعر البيع', 'number', '0')}</div>
                <div>{F('discount', 'الخصم %', 'number', '0')}</div>
                <div>{F('stock', 'الكمية', 'number', '0')}</div>
              </div>
              {form.sellingPrice && form.costPrice && (
                <div style={{ background: '#e8f5e9', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13 }}>
                  💰 الربح المتوقع: <strong style={{ color: '#27ae60' }}>{(Number(form.sellingPrice) * (1 - Number(form.discount) / 100) - Number(form.costPrice)).toFixed(2)} ج.م</strong>
                </div>
              )}
              <div style={{ marginBottom: 20 }}>
                <label style={ls}>🖼 الصور (حتى 5 صور)</label>
                <input type="file" accept="image/*" multiple onChange={e => setImages(Array.from(e.target.files).slice(0, 5))} style={{ ...is, padding: 8 }} />
                {images.length > 0 && <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>{images.map((img, i) => <img key={i} src={URL.createObjectURL(img)} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />)}</div>}
                {editing?.images?.length > 0 && <div style={{ marginTop: 8 }}><p style={{ fontSize: 13, color: '#888', margin: '0 0 6px' }}>الصور الحالية:</p><div style={{ display: 'flex', gap: 8 }}>{editing.images.map((img, i) => <img key={i} src={img.url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }} />)}</div></div>}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={busy} style={{ ...btnP, flex: 1, opacity: busy ? 0.7 : 1 }}>{busy ? 'جاري الحفظ...' : editing ? '💾 تحديث' : '➕ إضافة'}</button>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 20px', background: '#f5f5f5', color: '#555', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>جاري التحميل...</div> : (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead><tr style={{ background: '#f8f9fa' }}>
                {['', 'المنتج', 'الفئة', 'التكلفة', 'السعر', 'الربح', 'الكمية', 'إجراءات'].map(h => <th key={h} style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600, borderBottom: '2px solid #eee', whiteSpace: 'nowrap' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {products.map(p => {
                  const profit = p.sellingPrice * (1 - p.discount / 100) - p.costPrice;
                  return (
                    <tr key={p._id} style={{ borderBottom: '1px solid #f5f5f5', background: p.stock < 5 ? '#fff8f8' : '#fff' }}>
                      <td style={{ padding: '10px 14px' }}><img src={p.images?.[0]?.url || ''} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} /></td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1a3a5c' }}>{p.name?.ar}</td>
                      <td style={{ padding: '10px 14px', color: '#888' }}>{p.category?.ar}</td>
                      <td style={{ padding: '10px 14px' }}>{p.costPrice} ج.م</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>{p.sellingPrice} ج.م</td>
                      <td style={{ padding: '10px 14px', color: profit > 0 ? '#27ae60' : '#e74c3c', fontWeight: 600 }}>{profit.toFixed(0)} ج.م</td>
                      <td style={{ padding: '10px 14px' }}><span style={{ background: p.stock < 5 ? '#e74c3c' : '#e8f5e9', color: p.stock < 5 ? '#fff' : '#2e7d32', padding: '3px 10px', borderRadius: 12, fontWeight: 700, fontSize: 13 }}>{p.stock < 5 && '🔴 '}{p.stock}</span></td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => openEdit(p)} style={{ padding: '6px 10px', background: '#e3f2fd', color: '#1565c0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 16 }}>✏️</button>
                          <button onClick={() => del(p._id, p.name?.ar)} style={{ padding: '6px 10px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 16 }}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: 16 }}>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => <button key={p} onClick={() => load(p)} style={{ padding: '6px 12px', borderRadius: 6, background: p === pagination.page ? '#1a3a5c' : '#fff', color: p === pagination.page ? '#fff' : '#333', border: '1px solid #ddd', cursor: 'pointer' }}>{p}</button>)}
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
const ls = { display: 'block', marginBottom: 6, fontWeight: 600, color: '#555', fontSize: 13 };
const is = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fafafa', boxSizing: 'border-box' };
const btnP = { padding: '10px 20px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 };
