import { useState, useEffect } from 'react';
import { getShippingZones, addShippingZone, updateShippingZone, deleteShippingZone } from '../../api';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';

const DEFAULTS = [
  {ar:'القاهرة',en:'Cairo',price:35,min:1,max:2},{ar:'الجيزة',en:'Giza',price:35,min:1,max:2},
  {ar:'الإسكندرية',en:'Alexandria',price:45,min:2,max:3},{ar:'القليوبية',en:'Qalyubia',price:40,min:2,max:3},
  {ar:'الشرقية',en:'Sharqia',price:45,min:2,max:4},{ar:'الدقهلية',en:'Dakahlia',price:45,min:2,max:4},
  {ar:'البحيرة',en:'Beheira',price:50,min:3,max:5},{ar:'المنوفية',en:'Monufia',price:45,min:2,max:4},
  {ar:'كفر الشيخ',en:'Kafr el-Sheikh',price:50,min:3,max:5},{ar:'الغربية',en:'Gharbia',price:45,min:2,max:4},
  {ar:'الفيوم',en:'Fayoum',price:50,min:3,max:5},{ar:'بني سويف',en:'Beni Suef',price:55,min:3,max:6},
  {ar:'المنيا',en:'Minya',price:60,min:4,max:7},{ar:'أسيوط',en:'Asyut',price:65,min:4,max:7},
  {ar:'سوهاج',en:'Sohag',price:65,min:4,max:7},{ar:'قنا',en:'Qena',price:70,min:5,max:8},
  {ar:'الأقصر',en:'Luxor',price:70,min:5,max:8},{ar:'أسوان',en:'Aswan',price:75,min:5,max:9},
  {ar:'سيناء الشمالية',en:'North Sinai',price:65,min:4,max:7},{ar:'سيناء الجنوبية',en:'South Sinai',price:70,min:5,max:8},
  {ar:'الإسماعيلية',en:'Ismailia',price:50,min:2,max:4},{ar:'السويس',en:'Suez',price:50,min:2,max:4},
  {ar:'بورسعيد',en:'Port Said',price:50,min:2,max:4},{ar:'دمياط',en:'Damietta',price:50,min:2,max:4},
  {ar:'مطروح',en:'Matrouh',price:75,min:5,max:9},{ar:'الوادي الجديد',en:'New Valley',price:80,min:6,max:10},
  {ar:'البحر الأحمر',en:'Red Sea',price:70,min:5,max:8},
];

const EF = { governorateAr:'', governorateEn:'', price:'', minDays:'', maxDays:'' };

export default function AdminShipping() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EF);
  const [seeding, setSeeding] = useState(false);

  const load = () => { setLoading(true); getShippingZones().then(r => setZones(r.data.data)).catch(() => {}).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditId(null); setForm(EF); setShowForm(true); };
  const openEdit = z => { setEditId(z._id); setForm({ governorateAr: z.governorate.ar, governorateEn: z.governorate.en, price: z.price, minDays: z.estimatedDays.min, maxDays: z.estimatedDays.max }); setShowForm(true); };

  const submit = async e => {
    e.preventDefault();
    try {
      if (editId) { await updateShippingZone(editId, form); toast.success('تم التحديث ✓'); }
      else { await addShippingZone(form); toast.success('تمت الإضافة ✓'); }
      setShowForm(false); load();
    } catch (err) { toast.error(err.response?.data?.message || 'حدث خطأ'); }
  };

  const del = async (id, name) => { if (!window.confirm(`حذف "${name}"؟`)) return; try { await deleteShippingZone(id); toast.success('تم الحذف'); load(); } catch { toast.error('فشل الحذف'); } };

  const seed = async () => {
    if (!window.confirm('إضافة كل محافظات مصر؟')) return;
    setSeeding(true); let n = 0;
    for (const g of DEFAULTS) { if (!zones.find(z => z.governorate.ar === g.ar)) { try { await addShippingZone({ governorateAr: g.ar, governorateEn: g.en, price: g.price, minDays: g.min, maxDays: g.max }); n++; } catch {} } }
    toast.success(`تمت إضافة ${n} محافظة`); load(); setSeeding(false);
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: '#6D1A36' }}>🚚 إدارة الشحن</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          {zones.length === 0 && <button onClick={seed} disabled={seeding} style={{ padding: '10px 18px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>{seeding ? 'جاري الإضافة...' : '🇪🇬 إضافة كل محافظات مصر'}</button>}
          <button onClick={openAdd} style={{ padding: '10px 18px', background: '#6D1A36', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>+ إضافة محافظة</button>
        </div>
      </div>

      {showForm && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #f0e8e8' }}>
          <h3 style={{ margin: '0 0 20px', color: '#6D1A36' }}>{editId ? '✏️ تعديل' : '➕ إضافة محافظة'}</h3>
          <form onSubmit={submit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: 14 }}>
              {[
                { k: 'governorateAr', l: 'المحافظة (عربي)', p: 'القاهرة' },
                { k: 'governorateEn', l: 'Governorate (EN)', p: 'Cairo' },
                { k: 'price', l: 'سعر الشحن (ج.م)', p: '35', t: 'number' },
                { k: 'minDays', l: 'أقل وقت (أيام)', p: '1', t: 'number' },
                { k: 'maxDays', l: 'أقصى وقت (أيام)', p: '3', t: 'number' },
              ].map(f => (
                <div key={f.k}>
                  <label style={{ display: 'block', marginBottom: 5, fontWeight: 600, color: '#555', fontSize: 13 }}>{f.l}</label>
                  <input type={f.t || 'text'} required value={form[f.k]} placeholder={f.p} onChange={e => setForm({ ...form, [f.k]: e.target.value })} style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, background: '#fafafa', boxSizing: 'border-box' }} />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="submit" style={{ padding: '10px 18px', background: '#6D1A36', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>💾 حفظ</button>
              <button type="button" onClick={() => setShowForm(false)} style={{ padding: '10px 18px', background: '#f5f5f5', color: '#555', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div style={{ textAlign: 'center', padding: '60px 0' }}>جاري التحميل...</div> : (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead><tr style={{ background: '#f8f9fa' }}>
              {['المحافظة (عربي)','Governorate (EN)','سعر الشحن','وقت التوصيل','إجراءات'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, borderBottom: '2px solid #eee' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {zones.map(z => (
                <tr key={z._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{z.governorate.ar}</td>
                  <td style={{ padding: '12px 16px', color: '#666' }}>{z.governorate.en}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#6D1A36' }}>{z.price} ج.م</td>
                  <td style={{ padding: '12px 16px', color: '#555' }}>{z.estimatedDays.min}–{z.estimatedDays.max} أيام</td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(z)} style={{ padding: '6px 12px', background: '#e3f2fd', color: '#1565c0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>✏️ تعديل</button>
                      <button onClick={() => del(z._id, z.governorate.ar)} style={{ padding: '6px 12px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>🗑 حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
              {zones.length === 0 && <tr><td colSpan={5} style={{ padding: '40px 0', textAlign: 'center', color: '#aaa' }}>لا توجد محافظات — اضغط "إضافة كل محافظات مصر"</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
