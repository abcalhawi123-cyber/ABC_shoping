import { useState, useEffect } from 'react';
import { getAdminProducts, createProduct, updateProduct, deleteProduct } from '../../api';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import { useLang } from '../../context/LangContext';

const BG = '#6D1A36';
const EF = { nameAr:'', nameEn:'', categoryAr:'', categoryEn:'', descriptionAr:'', descriptionEn:'', costPrice:'', sellingPrice:'', discount:'0' };

export default function AdminProducts() {
  const { t, lang } = useLang();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page:1, pages:1 });
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EF);
  const [images, setImages] = useState([]);
  const [busy, setBusy] = useState(false);
  // Color variants state
  const [variants, setVariants] = useState([]); // [{color:'', quantity:0}]

  const load = (page=1) => {
    setLoading(true);
    getAdminProducts({ page }).then(r => { setProducts(r.data.data); setPagination(r.data.pagination); }).catch(() => toast.error('فشل')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EF); setImages([]); setVariants([]); setShowForm(true); };
  const openEdit = p => {
    setEditing(p);
    setForm({ nameAr:p.name?.ar||'', nameEn:p.name?.en||'', categoryAr:p.category?.ar||'', categoryEn:p.category?.en||'', descriptionAr:p.description?.ar||'', descriptionEn:p.description?.en||'', costPrice:p.costPrice||'', sellingPrice:p.sellingPrice||'', discount:p.discount||'0' });
    setVariants(p.colorVariants?.length ? p.colorVariants.map(v => ({...v})) : []);
    setImages([]);
    setShowForm(true);
  };

  const addVariant = () => setVariants(v => [...v, { color:'', quantity:0 }]);
  const removeVariant = i => setVariants(v => v.filter((_, idx) => idx !== i));
  const updateVariant = (i, field, val) => setVariants(v => v.map((item, idx) => idx === i ? { ...item, [field]: field === 'quantity' ? Number(val) : val } : item));

  const submit = async e => {
    e.preventDefault();
    if (variants.length === 0) return toast.error(lang === 'ar' ? 'أضف لون وكمية واحدة على الأقل' : 'Add at least one color variant');
    if (variants.some(v => !v.color.trim())) return toast.error(lang === 'ar' ? 'أدخل اسم اللون لكل لون' : 'Enter color name for all variants');
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k, v));
      fd.append('colorVariants', JSON.stringify(variants));
      images.forEach(img => fd.append('images', img));
      if (editing) { await updateProduct(editing._id, fd); toast.success(lang==='ar'?'تم التحديث ✓':'Updated ✓'); }
      else { await createProduct(fd); toast.success(lang==='ar'?'تمت الإضافة ✓':'Added ✓'); }
      setShowForm(false); load(pagination.page);
    } catch (err) { toast.error(err.response?.data?.message || 'خطأ'); }
    setBusy(false);
  };

  const del = async (id, name) => {
    if (!window.confirm(`${lang==='ar'?'حذف':'Delete'} "${name}"?`)) return;
    try { await deleteProduct(id); toast.success(lang==='ar'?'تم الحذف':'Deleted'); load(pagination.page); }
    catch { toast.error(lang==='ar'?'فشل الحذف':'Delete failed'); }
  };

  const totalStock = variants.reduce((s,v) => s + (Number(v.quantity)||0), 0);

  return (
    <AdminLayout>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <h2 style={{ margin:0, color:BG }}>📦 {t('products')}</h2>
        <button onClick={openAdd} style={{ padding:'10px 20px', background:BG, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>+ {t('addProduct')}</button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'flex-start', justifyContent:'center', padding:20, overflowY:'auto' }}>
          <div style={{ background:'#fff', borderRadius:16, padding:28, width:'100%', maxWidth:720, marginTop:20, boxShadow:'0 16px 48px rgba(0,0,0,0.2)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
              <h3 style={{ margin:0, color:BG }}>{editing ? `✏️ ${lang==='ar'?'تعديل المنتج':'Edit Product'}` : `➕ ${lang==='ar'?'إضافة منتج جديد':'Add New Product'}`}</h3>
              <button onClick={() => setShowForm(false)} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#888' }}>✕</button>
            </div>
            <form onSubmit={submit}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                {[
                  { k:'nameAr', l:`${lang==='ar'?'اسم المنتج (عربي)':'Product Name (AR)'} — ${lang==='ar'?'اكتبه يدوياً':'type manually'}`, p:lang==='ar'?'مثل: دبدوب':'e.g. Teddy Bear' },
                  { k:'nameEn', l:`Product Name (EN) — type manually`, p:'e.g. Plush Teddy Bear' },
                  { k:'categoryAr', l:`${lang==='ar'?'الفئة (عربي)':'Category (AR)'} — ${lang==='ar'?'اكتبها يدوياً':'type manually'}`, p:lang==='ar'?'مثل: ألعاب قطنية':'e.g. Cotton Toys' },
                  { k:'categoryEn', l:`Category (EN) — type manually`, p:'e.g. Plush Toys' },
                ].map(f => (
                  <div key={f.k}>
                    <label style={ls}>{f.l}</label>
                    <input value={form[f.k]} onChange={e => setForm({...form,[f.k]:e.target.value})} placeholder={f.p} style={is} />
                  </div>
                ))}
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={ls}>{lang==='ar'?'الوصف (عربي)':'Description (AR)'}</label>
                <textarea value={form.descriptionAr} onChange={e => setForm({...form,descriptionAr:e.target.value})} rows={2} style={{...is,resize:'vertical'}} />
              </div>
              <div style={{ marginBottom:14 }}>
                <label style={ls}>Description (EN)</label>
                <textarea value={form.descriptionEn} onChange={e => setForm({...form,descriptionEn:e.target.value})} rows={2} style={{...is,resize:'vertical'}} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12, marginBottom:14 }}>
                {[
                  {k:'costPrice',l:lang==='ar'?'سعر التكلفة':'Cost Price',p:'0'},
                  {k:'sellingPrice',l:lang==='ar'?'سعر البيع':'Selling Price',p:'0'},
                  {k:'discount',l:lang==='ar'?'الخصم %':'Discount %',p:'0'},
                ].map(f => (
                  <div key={f.k}>
                    <label style={ls}>{f.l}</label>
                    <input type="number" value={form[f.k]} onChange={e => setForm({...form,[f.k]:e.target.value})} placeholder={f.p} style={is} />
                  </div>
                ))}
              </div>

              {/* Profit preview */}
              {form.sellingPrice && form.costPrice && (
                <div style={{ background:'#fdf5f7', borderRadius:8, padding:'10px 14px', marginBottom:16, fontSize:13, color:BG, fontWeight:600 }}>
                  💰 {lang==='ar'?'الربح المتوقع:':'Expected profit:'} {(Number(form.sellingPrice)*(1-Number(form.discount)/100)-Number(form.costPrice)).toFixed(2)} ج.م
                </div>
              )}

              {/* Color Variants — replaces single stock field */}
              <div style={{ background:'#f9f9f9', borderRadius:10, padding:16, marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                  <label style={{ fontWeight:700, color:BG, fontSize:14 }}>🎨 {t('colorVariants')} {totalStock > 0 && <span style={{ color:'#27ae60', fontWeight:600, fontSize:12 }}>({lang==='ar'?'الإجمالي:':'Total:'} {totalStock})</span>}</label>
                  <button type="button" onClick={addVariant} style={{ padding:'6px 14px', background:BG, color:'#fff', border:'none', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:600 }}>
                    + {t('addColor')}
                  </button>
                </div>
                {variants.length === 0 && (
                  <p style={{ color:'#aaa', fontSize:13, margin:0, textAlign:'center' }}>{lang==='ar'?'أضف لون واحد على الأقل':'Add at least one color'}</p>
                )}
                {variants.map((v, i) => (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 120px 36px', gap:8, marginBottom:8 }}>
                    <input value={v.color} onChange={e => updateVariant(i,'color',e.target.value)} placeholder={lang==='ar'?'اسم اللون (مثل: أحمر)':'Color name (e.g. Red)'} style={{ ...is, marginBottom:0 }} />
                    <input type="number" min="0" value={v.quantity} onChange={e => updateVariant(i,'quantity',e.target.value)} placeholder={t('quantity')} style={{ ...is, marginBottom:0 }} />
                    <button type="button" onClick={() => removeVariant(i)} style={{ background:'#ffebee', color:'#c62828', border:'none', borderRadius:6, cursor:'pointer', fontSize:16, fontWeight:700 }}>✕</button>
                  </div>
                ))}
              </div>

              {/* Images */}
              <div style={{ marginBottom:18 }}>
                <label style={ls}>🖼 {lang==='ar'?'الصور (حتى 5 صور)':'Images (up to 5)'}</label>
                <input type="file" accept="image/*" multiple onChange={e => setImages(Array.from(e.target.files).slice(0,5))} style={{...is,padding:8}} />
                {images.length > 0 && <div style={{ display:'flex', gap:8, marginTop:8 }}>{images.map((img,i) => <img key={i} src={URL.createObjectURL(img)} alt="" style={{ width:56, height:56, objectFit:'cover', borderRadius:8 }} />)}</div>}
                {editing?.images?.length > 0 && (
                  <div style={{ marginTop:8 }}>
                    <p style={{ fontSize:12, color:'#888', margin:'0 0 6px' }}>{lang==='ar'?'الصور الحالية:':'Current images:'}</p>
                    <div style={{ display:'flex', gap:8 }}>{editing.images.map((img,i) => <img key={i} src={img.url} alt="" style={{ width:56, height:56, objectFit:'cover', borderRadius:8, border:'1px solid #ddd' }} />)}</div>
                  </div>
                )}
              </div>

              <div style={{ display:'flex', gap:10 }}>
                <button type="submit" disabled={busy} style={{ flex:1, padding:'12px', background:busy?'#ccc':BG, color:'#fff', border:'none', borderRadius:8, fontWeight:700, cursor:busy?'not-allowed':'pointer', fontSize:14 }}>
                  {busy?'...':(editing?`💾 ${t('save')}`:(`➕ ${lang==='ar'?'إضافة':'Add'}`))}
                </button>
                <button type="button" onClick={() => setShowForm(false)} style={{ padding:'12px 20px', background:'#f5f5f5', color:'#555', border:'1px solid #ddd', borderRadius:8, cursor:'pointer', fontSize:14 }}>
                  {t('cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products table */}
      {loading ? <div style={{ textAlign:'center', padding:'60px 0', color:'#888' }}>{t('loading')}</div> : (
        <div style={{ background:'#fff', borderRadius:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
              <thead>
                <tr style={{ background:'#fdf5f7' }}>
                  {['','المنتج','الفئة','سعر التكلفة','سعر البيع','الربح','المخزون','إجراءات'].map(h => (
                    <th key={h} style={{ padding:'12px 14px', textAlign:'right', fontWeight:600, borderBottom:`2px solid ${BG}20`, whiteSpace:'nowrap', color:BG }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => {
                  const profit = p.sellingPrice*(1-p.discount/100)-p.costPrice;
                  return (
                    <tr key={p._id} style={{ borderBottom:'1px solid #f5f5f5', background: p.stock<5?'#fff8f8':'#fff' }}>
                      <td style={{ padding:'10px 14px' }}><img src={p.images?.[0]?.url||''} alt="" style={{ width:44, height:44, objectFit:'cover', borderRadius:8 }} /></td>
                      <td style={{ padding:'10px 14px', fontWeight:600, color:'#1a1a1a' }}>{p.name?.ar}</td>
                      <td style={{ padding:'10px 14px', color:'#888' }}>{p.category?.ar}</td>
                      <td style={{ padding:'10px 14px' }}>{p.costPrice} ج.م</td>
                      <td style={{ padding:'10px 14px', fontWeight:600 }}>{p.sellingPrice} ج.م</td>
                      <td style={{ padding:'10px 14px', color:profit>0?'#27ae60':'#c0392b', fontWeight:600 }}>{profit.toFixed(0)} ج.م</td>
                      <td style={{ padding:'10px 14px' }}>
                        <span style={{ background:p.stock<5?'#c0392b':'#e8f5e9', color:p.stock<5?'#fff':'#2e7d32', padding:'3px 10px', borderRadius:12, fontWeight:700, fontSize:12 }}>
                          {p.stock<5&&'🔴 '}{p.stock}
                        </span>
                        {p.colorVariants?.length > 0 && (
                          <div style={{ marginTop:4 }}>
                            {p.colorVariants.map(v => (
                              <span key={v.color} style={{ display:'inline-block', fontSize:10, background:'#f0f0f0', color:'#555', padding:'2px 6px', borderRadius:8, marginInlineEnd:4, marginTop:2 }}>
                                {v.color}: {v.quantity}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td style={{ padding:'10px 14px' }}>
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={() => openEdit(p)} style={{ padding:'6px 10px', background:'#e3f2fd', color:'#1565c0', border:'none', borderRadius:6, cursor:'pointer', fontSize:15 }}>✏️</button>
                          <button onClick={() => del(p._id, p.name?.ar)} style={{ padding:'6px 10px', background:'#ffebee', color:'#c62828', border:'none', borderRadius:6, cursor:'pointer', fontSize:15 }}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {pagination.pages > 1 && (
            <div style={{ display:'flex', gap:8, justifyContent:'center', padding:16 }}>
              {Array.from({length:pagination.pages},(_,i)=>i+1).map(p => (
                <button key={p} onClick={() => load(p)} style={{ padding:'6px 12px', borderRadius:6, background:p===pagination.page?BG:'#fff', color:p===pagination.page?'#fff':'#333', border:'1px solid #ddd', cursor:'pointer' }}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
const ls = { display:'block', marginBottom:6, fontWeight:600, color:'#555', fontSize:13 };
const is = { width:'100%', padding:'10px 12px', border:'1px solid #ddd', borderRadius:8, fontSize:14, background:'#fafafa', boxSizing:'border-box', marginBottom:14 };
