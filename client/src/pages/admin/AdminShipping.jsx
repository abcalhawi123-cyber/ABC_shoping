import { useState, useEffect } from 'react';
import { getShippingZones, addShippingZone, updateShippingZone, deleteShippingZone } from '../../api';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';

// Pre-populated Egypt governorates as defaults (admin can edit/add/delete)
const EGYPT_DEFAULTS = [
  { ar: 'القاهرة', en: 'Cairo', price: 35, min: 1, max: 2 },
  { ar: 'الجيزة', en: 'Giza', price: 35, min: 1, max: 2 },
  { ar: 'الإسكندرية', en: 'Alexandria', price: 45, min: 2, max: 3 },
  { ar: 'القليوبية', en: 'Qalyubia', price: 40, min: 2, max: 3 },
  { ar: 'الشرقية', en: 'Sharqia', price: 45, min: 2, max: 4 },
  { ar: 'الدقهلية', en: 'Dakahlia', price: 45, min: 2, max: 4 },
  { ar: 'البحيرة', en: 'Beheira', price: 50, min: 3, max: 5 },
  { ar: 'المنوفية', en: 'Monufia', price: 45, min: 2, max: 4 },
  { ar: 'كفر الشيخ', en: 'Kafr el-Sheikh', price: 50, min: 3, max: 5 },
  { ar: 'الغربية', en: 'Gharbia', price: 45, min: 2, max: 4 },
  { ar: 'الفيوم', en: 'Fayoum', price: 50, min: 3, max: 5 },
  { ar: 'بني سويف', en: 'Beni Suef', price: 55, min: 3, max: 6 },
  { ar: 'المنيا', en: 'Minya', price: 60, min: 4, max: 7 },
  { ar: 'أسيوط', en: 'Asyut', price: 65, min: 4, max: 7 },
  { ar: 'سوهاج', en: 'Sohag', price: 65, min: 4, max: 7 },
  { ar: 'قنا', en: 'Qena', price: 70, min: 5, max: 8 },
  { ar: 'الأقصر', en: 'Luxor', price: 70, min: 5, max: 8 },
  { ar: 'أسوان', en: 'Aswan', price: 75, min: 5, max: 9 },
  { ar: 'سيناء الشمالية', en: 'North Sinai', price: 65, min: 4, max: 7 },
  { ar: 'سيناء الجنوبية', en: 'South Sinai', price: 70, min: 5, max: 8 },
  { ar: 'الإسماعيلية', en: 'Ismailia', price: 50, min: 2, max: 4 },
  { ar: 'السويس', en: 'Suez', price: 50, min: 2, max: 4 },
  { ar: 'بورسعيد', en: 'Port Said', price: 50, min: 2, max: 4 },
  { ar: 'دمياط', en: 'Damietta', price: 50, min: 2, max: 4 },
  { ar: 'مطروح', en: 'Matrouh', price: 75, min: 5, max: 9 },
  { ar: 'الوادي الجديد', en: 'New Valley', price: 80, min: 6, max: 10 },
  { ar: 'البحر الأحمر', en: 'Red Sea', price: 70, min: 5, max: 8 },
];

const EMPTY = { governorateAr: '', governorateEn: '', price: '', minDays: '', maxDays: '' };

export default function AdminShipping() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [seeding, setSeeding] = useState(false);

  const fetchZones = async () => {
    setLoading(true);
    try {
      const { data } = await getShippingZones();
      setZones(data.data);
    } catch { toast.error('فشل التحميل'); }
    setLoading(false);
  };

  useEffect(() => { fetchZones(); }, []);

  const openAdd = () => { setEditingId(null); setForm(EMPTY); setShowForm(true); };
  const openEdit = (z) => {
    setEditingId(z._id);
    setForm({ governorateAr: z.governorate.ar, governorateEn: z.governorate.en, price: z.price, minDays: z.estimatedDays.min, maxDays: z.estimatedDays.max });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateShippingZone(editingId, form);
        toast.success('تم التحديث ✓');
      } else {
        await addShippingZone(form);
        toast.success('تمت الإضافة ✓');
      }
      setShowForm(false);
      fetchZones();
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`حذف "${name}"؟`)) return;
    try {
      await deleteShippingZone(id);
      toast.success('تم الحذف');
      fetchZones();
    } catch { toast.error('فشل الحذف'); }
  };

  // Seed all Egypt governorates at once
  const handleSeedDefaults = async () => {
    if (!window.confirm('هذا سيضيف كل محافظات مصر الافتراضية — متأكد؟')) return;
    setSeeding(true);
    let count = 0;
    for (const g of EGYPT_DEFAULTS) {
      const exists = zones.find(z => z.governorate.ar === g.ar);
      if (!exists) {
        try {
          await addShippingZone({ governorateAr: g.ar, governorateEn: g.en, price: g.price, minDays: g.min, maxDays: g.max });
          count++;
        } catch { /* skip duplicates */ }
      }
    }
    toast.success(`تمت إضافة ${count} محافظة`);
    fetchZones();
    setSeeding(false);
  };

  return (
    <AdminLayout>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: '#1a3a5c' }}>🚚 إدارة الشحن</h2>
        <div style={{ display: 'flex', gap: 10 }}>
          {zones.length === 0 && (
            <button onClick={handleSeedDefaults} disabled={seeding} style={{ ...btnPrimary, background: '#27ae60' }}>
              {seeding ? 'جاري الإضافة...' : '🇪🇬 إضافة كل محافظات مصر'}
            </button>
          )}
          <button onClick={openAdd} style={btnPrimary}>+ إضافة محافظة</button>
        </div>
      </div>

      <p style={{ color: '#888', fontSize: 13, marginBottom: 20 }}>
        💡 الأسعار وأوقات التوصيل يمكن تعديلها في أي وقت من هنا. تُطبق على الفور على كل الطلبات الجديدة.
      </p>

      {/* Form */}
      {showForm && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #f0e8e8' }}>
          <h3 style={{ margin: '0 0 20px', color: '#1a3a5c' }}>{editingId ? '✏️ تعديل المحافظة' : '➕ إضافة محافظة'}</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: 14 }}>
              {[
                { key: 'governorateAr', label: 'اسم المحافظة (عربي)', placeholder: 'مثل: القاهرة' },
                { key: 'governorateEn', label: 'Governorate (EN)', placeholder: 'e.g. Cairo' },
                { key: 'price', label: 'سعر الشحن (ج.م)', placeholder: '35', type: 'number' },
                { key: 'minDays', label: 'أقل وقت (أيام)', placeholder: '1', type: 'number' },
                { key: 'maxDays', label: 'أقصى وقت (أيام)', placeholder: '3', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label style={labelStyle}>{f.label}</label>
                  <input
                    type={f.type || 'text'}
                    required
                    value={form[f.key]}
                    placeholder={f.placeholder}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button type="submit" style={btnPrimary}>💾 حفظ</button>
              <button type="button" onClick={() => setShowForm(false)} style={btnSecondary}>إلغاء</button>
            </div>
          </form>
        </div>
      )}

      {/* Zones table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>جاري التحميل...</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                {['المحافظة (عربي)', 'Governorate (EN)', 'سعر الشحن', 'وقت التوصيل', 'الحالة', 'إجراءات'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'right', color: '#2c3e50', fontWeight: 600, borderBottom: '2px solid #eee' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {zones.map(zone => (
                <tr key={zone._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>{zone.governorate.ar}</td>
                  <td style={{ padding: '12px 16px', color: '#666' }}>{zone.governorate.en}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: '#1a3a5c' }}>{zone.price} ج.م</td>
                  <td style={{ padding: '12px 16px', color: '#555' }}>{zone.estimatedDays.min}–{zone.estimatedDays.max} أيام</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      background: zone.isActive ? '#e8f5e9' : '#ffebee',
                      color: zone.isActive ? '#27ae60' : '#e74c3c',
                      padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                    }}>
                      {zone.isActive ? 'نشط' : 'معطل'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => openEdit(zone)} style={btnEdit}>✏️ تعديل</button>
                      <button onClick={() => handleDelete(zone._id, zone.governorate.ar)} style={btnDel}>🗑 حذف</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {zones.length === 0 && (
            <p style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>لا توجد محافظات بعد — اضغط "إضافة كل محافظات مصر" للبدء</p>
          )}
        </div>
      )}
    </AdminLayout>
  );
}

const labelStyle = { display: 'block', marginBottom: 5, fontWeight: 600, color: '#555', fontSize: 13 };
const inputStyle = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 13, background: '#fafafa', boxSizing: 'border-box' };
const btnPrimary = { padding: '10px 18px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 };
const btnSecondary = { padding: '10px 18px', background: '#f5f5f5', color: '#555', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 };
const btnEdit = { padding: '6px 12px', background: '#e3f2fd', color: '#1565c0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 };
const btnDel = { padding: '6px 12px', background: '#ffebee', color: '#c62828', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13 };
