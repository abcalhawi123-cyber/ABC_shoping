import { useState, useEffect } from 'react';
import { getAdminProducts, createProduct, updateProduct, deleteProduct } from '../../api';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';

const EMPTY_FORM = {
  nameAr: '', nameEn: '',
  categoryAr: '', categoryEn: '',
  descriptionAr: '', descriptionEn: '',
  costPrice: '', sellingPrice: '', discount: '0', stock: '',
  metaTitle: '', metaDescription: '',
};

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null); // product being edited
  const [form, setForm] = useState(EMPTY_FORM);
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [filterLowStock, setFilterLowStock] = useState(false);

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await getAdminProducts({ page, lowStock: filterLowStock || undefined });
      setProducts(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('فشل تحميل المنتجات');
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(1); }, [filterLowStock]);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setImages([]);
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({
      nameAr: p.name?.ar || '',
      nameEn: p.name?.en || '',
      categoryAr: p.category?.ar || '',
      categoryEn: p.category?.en || '',
      descriptionAr: p.description?.ar || '',
      descriptionEn: p.description?.en || '',
      costPrice: p.costPrice || '',
      sellingPrice: p.sellingPrice || '',
      discount: p.discount || '0',
      stock: p.stock || '',
      metaTitle: p.metaTitle || '',
      metaDescription: p.metaDescription || '',
    });
    setImages([]);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach(img => fd.append('images', img));

      if (editing) {
        await updateProduct(editing._id, fd);
        toast.success('تم تحديث المنتج ✓');
      } else {
        await createProduct(fd);
        toast.success('تمت إضافة المنتج ✓');
      }
      setShowForm(false);
      fetchProducts(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    }
    setSubmitting(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`هل تريد حذف "${name}"؟`)) return;
    try {
      await deleteProduct(id);
      toast.success('تم حذف المنتج');
      fetchProducts(pagination.page);
    } catch {
      toast.error('فشل الحذف');
    }
  };

  const f = (key, label, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );

  const ta = (key, label, placeholder = '') => (
    <div style={{ marginBottom: 14 }}>
      <label style={labelStyle}>{label}</label>
      <textarea
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        rows={3}
        style={{ ...inputStyle, resize: 'vertical' }}
      />
    </div>
  );

  return (
    <AdminLayout>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: '#1a3a5c' }}>📦 إدارة المنتجات</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={filterLowStock} onChange={e => setFilterLowStock(e.target.checked)} />
            <span style={{ color: filterLowStock ? '#e74c3c' : '#555' }}>مخزون منخفض فقط 🔴</span>
          </label>
          <button onClick={openAdd} style={btnPrimary}>+ إضافة منتج</button>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          zIndex: 1000, display: 'flex', alignItems: 'flex-start',
          justifyContent: 'center', padding: '20px', overflowY: 'auto',
        }}>
          <div style={{
            background: '#fff', borderRadius: 16, padding: 32,
            width: '100%', maxWidth: 700,
            boxShadow: '0 16px 48px rgba(0,0,0,0.2)', marginTop: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <h3 style={{ margin: 0, color: '#1a3a5c' }}>{editing ? '✏️ تعديل المنتج' : '➕ إضافة منتج جديد'}</h3>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>✕</button>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Names — TEXT INPUTS, no dropdowns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>{f('nameAr', 'اسم المنتج (عربي)', 'text', 'مثل: دبدوب قطيفة كبير')}</div>
                <div>{f('nameEn', 'Product Name (English)', 'text', 'e.g. Large Plush Teddy Bear')}</div>
                <div>{f('categoryAr', 'الفئة (عربي) — اكتبها يدوياً', 'text', 'مثل: دباديب، ميداليات، شنط...')}</div>
                <div>{f('categoryEn', 'Category (English) — type manually', 'text', 'e.g. Bears, Keychains, Bags...')}</div>
              </div>

              {ta('descriptionAr', 'الوصف (عربي)', 'اكتب وصفاً جذاباً للمنتج...')}
              {ta('descriptionEn', 'Description (English)', 'Write an attractive product description...')}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 12 }}>
                <div>{f('costPrice', 'سعر التكلفة (ج.م)', 'number', '0')}</div>
                <div>{f('sellingPrice', 'سعر البيع (ج.م)', 'number', '0')}</div>
                <div>{f('discount', 'الخصم (%)', 'number', '0')}</div>
                <div>{f('stock', 'الكمية', 'number', '0')}</div>
              </div>

              {/* Computed profit preview */}
              {form.sellingPrice && form.costPrice && (
                <div style={{ background: '#e8f5e9', borderRadius: 8, padding: '10px 14px', marginBottom: 14, fontSize: 13 }}>
                  💰 الربح المتوقع للقطعة:
                  <strong style={{ color: '#27ae60', marginRight: 6 }}>
                    {(Number(form.sellingPrice) * (1 - Number(form.discount) / 100) - Number(form.costPrice)).toFixed(2)} ج.م
                  </strong>
                </div>
              )}

              {/* SEO fields */}
              <details style={{ marginBottom: 14 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600, color: '#1a3a5c', marginBottom: 10 }}>🔍 إعدادات SEO (اختياري)</summary>
                {f('metaTitle', 'عنوان SEO')}
                {f('metaDescription', 'وصف SEO')}
              </details>

              {/* Images */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>🖼 الصور (حتى 5 صور)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={e => setImages(Array.from(e.target.files).slice(0, 5))}
                  style={{ ...inputStyle, padding: 8 }}
                />
                {images.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                    {images.map((img, i) => (
                      <img key={i} src={URL.createObjectURL(img)} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8 }} />
                    ))}
                  </div>
                )}
                {editing?.images?.length > 0 && (
                  <div style={{ marginTop: 8 }}>
                    <p style={{ fontSize: 13, color: '#888', margin: '0 0 6px' }}>الصور الحالية:</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {editing.images.map((img, i) => (
                        <img key={i} src={img.url} alt="" style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, border: '1px solid #ddd' }} />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={submitting} style={{ ...btnPrimary, flex: 1, opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'جاري الحفظ...' : editing ? '💾 تحديث المنتج' : '➕ إضافة المنتج'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={btnSecondary}>إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>جاري التحميل...</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {['', 'المنتج', 'الفئة', 'التكلفة', 'السعر', 'الربح', 'الكمية', 'الحالة', 'إجراءات'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'right', color: '#2c3e50', fontWeight: 600, borderBottom: '2px solid #eee', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const profit = p.sellingPrice * (1 - p.discount / 100) - p.costPrice;
                  const isLow = p.stock < 5;
                  return (
                    <tr key={p._id} style={{ borderBottom: '1px solid #f5f5f5', background: isLow ? '#fff8f8' : '#fff' }}>
                      <td style={{ padding: '10px 14px' }}>
                        <img src={p.images?.[0]?.url || ''} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                      </td>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1a3a5c' }}>{p.name?.ar}</td>
                      <td style={{ padding: '10px 14px', color: '#888' }}>{p.category?.ar}</td>
                      <td style={{ padding: '10px 14px' }}>{p.costPrice} ج.م</td>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>{p.sellingPrice} ج.م</td>
                      <td style={{ padding: '10px 14px', color: profit > 0 ? '#27ae60' : '#e74c3c', fontWeight: 600 }}>{profit.toFixed(0)} ج.م</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          background: isLow ? '#e74c3c' : '#e8f5e9',
                          color: isLow ? '#fff' : '#2e7d32',
                          padding: '3px 10px', borderRadius: 12, fontWeight: 700,
                          fontSize: 13,
                        }}>
                          {isLow && '🔴 '}{p.stock}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{
                          background: p.isActive ? '#e8f5e9' : '#ffebee',
                          color: p.isActive ? '#27ae60' : '#e74c3c',
                          padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                        }}>
                          {p.isActive ? 'نشط' : 'مخفي'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button onClick={() => openEdit(p)} style={btnEdit}>✏️</button>
                          <button onClick={() => handleDelete(p._id, p.name?.ar)} style={btnDel}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '16px' }}>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => fetchProducts(p)}
                  style={{
                    padding: '6px 12px', borderRadius: 6,
                    background: p === pagination.page ? '#1a3a5c' : '#fff',
                    color: p === pagination.page ? '#fff' : '#333',
                    border: '1px solid #ddd', cursor: 'pointer',
                  }}
                >{p}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 600, color: '#555', fontSize: 13 };
const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fafafa', boxSizing: 'border-box' };
const btnPrimary = { padding: '10px 20px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 };
const btnSecondary = { padding: '10px 20px', background: '#f5f5f5', color: '#555', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 };
const btnEdit = { padding: '6px 10px', background: '#e3f2fd', color: '#1565c0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 16 };
const btnDel = { padding: '6px 10px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 16 };
