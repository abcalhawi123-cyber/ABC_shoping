import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard, updateOrderPayment, exportReport } from '../../api';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';

const SC = { 'قيد المراجعة': { bg: '#fff3e0', c: '#ef6c00' }, 'جاري التجهيز': { bg: '#e3f2fd', c: '#1565c0' }, 'تم الشحن': { bg: '#e8eaf6', c: '#3949ab' }, 'تم التسليم': { bg: '#e8f5e9', c: '#2e7d32' }, 'مرتجع': { bg: '#ffebee', c: '#c62828' } };

// Manual overrides are stored locally in the admin's browser only — they change
// what this dashboard displays, not any underlying data on the server.
const OVERRIDE_KEY = 'admin_dashboard_overrides_v1';
const loadOverrides = () => {
  try { return JSON.parse(localStorage.getItem(OVERRIDE_KEY)) || {}; } catch { return {}; }
};
const saveOverrides = (o) => localStorage.setItem(OVERRIDE_KEY, JSON.stringify(o));

function Badge({ s }) {
  const x = SC[s] || { bg: '#f5f5f5', c: '#333' };
  return <span style={{ background: x.bg, color: x.c, padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{s}</span>;
}

// A KPI card that can be manually overridden by the admin.
function EditableKpi({ id, label, actualValue, displayValue, icon, color, overrides, setOverrides, formatAsMoney }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const isOverridden = overrides[id] !== undefined && overrides[id] !== null && overrides[id] !== '';

  const startEdit = () => {
    setDraft(isOverridden ? String(overrides[id]) : String(actualValue));
    setEditing(true);
  };

  const save = () => {
    const num = Number(draft);
    if (Number.isNaN(num)) return toast.error('أدخل رقم صحيح');
    const next = { ...overrides, [id]: num };
    setOverrides(next);
    saveOverrides(next);
    setEditing(false);
    toast.success('تم الحفظ (تعديل يدوي)');
  };

  const reset = () => {
    const next = { ...overrides };
    delete next[id];
    setOverrides(next);
    saveOverrides(next);
    toast.success('تم إرجاع القيمة الفعلية');
  };

  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderBottom: `4px solid ${color}`, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <p style={{ margin: '0 0 6px', color: '#888', fontSize: 13 }}>{label}</p>
        <button
          onClick={startEdit}
          title="تعديل يدوي"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#aaa', padding: 0 }}
        >
          ✏️
        </button>
      </div>

      {editing ? (
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input
            type="number"
            value={draft}
            onChange={e => setDraft(e.target.value)}
            autoFocus
            style={{ width: '100%', padding: '6px 8px', border: '1px solid #ddd', borderRadius: 6, fontSize: 16, fontWeight: 700 }}
          />
          <button onClick={save} style={{ background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>✓</button>
          <button onClick={() => setEditing(false)} style={{ background: '#f5f5f5', color: '#555', border: 'none', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', fontSize: 12 }}>✕</button>
        </div>
      ) : (
        <>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color }}>
            {icon} {formatAsMoney ? `${Number(displayValue).toFixed(0)} ج.م` : displayValue}
          </p>
          {isOverridden && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <span style={{ fontSize: 10, color: '#e67e22', fontWeight: 600 }}>✎ تعديل يدوي</span>
              <button onClick={reset} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 10, color: '#3498db', textDecoration: 'underline', padding: 0 }}>
                إرجاع القيمة الفعلية
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [overrides, setOverrides] = useState(loadOverrides());

  const load = () => { setLoading(true); getDashboard().then(r => setData(r.data.data)).catch(() => toast.error('فشل التحميل')).finally(() => setLoading(false)); };
  useEffect(() => { load(); }, []);

  const approve = async (id, status) => {
    try { await updateOrderPayment(id, { paymentStatus: status }); toast.success(status === 'approved' ? 'تمت الموافقة ✓' : 'تم الرفض'); load(); }
    catch { toast.error('حدث خطأ'); }
  };

  const exp = async fmt => {
    try {
      const r = await exportReport(fmt);
      const url = URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a'); a.href = url; a.download = `report.${fmt === 'excel' ? 'xlsx' : 'pdf'}`; a.click();
    } catch { toast.error('فشل التصدير'); }
  };

  if (loading) return <AdminLayout><div style={{ padding: 40, textAlign: 'center' }}>جاري التحميل...</div></AdminLayout>;
  if (!data) return null;

  const { salesStats, profitStats, lowStockProducts, recentOrders, topProducts, pendingInstapayApprovals } = data;

  const actualOrderCount = salesStats.orderCount || 0;
  const actualRevenue = salesStats.totalRevenue || 0;
  const actualProfit = profitStats?.totalProfit || 0;

  const displayOrderCount = overrides.orderCount ?? actualOrderCount;
  const displayRevenue = overrides.revenue ?? actualRevenue;
  const displayProfit = overrides.profit ?? actualProfit;

  return (
    <AdminLayout>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 16, marginBottom: 28 }}>
        <EditableKpi
          id="orderCount" label="إجمالي الطلبات" icon="📦" color="#6D1A36"
          actualValue={actualOrderCount} displayValue={displayOrderCount}
          overrides={overrides} setOverrides={setOverrides}
        />
        <EditableKpi
          id="revenue" label="إجمالي الإيرادات" icon="💰" color="#3498db"
          actualValue={actualRevenue} displayValue={displayRevenue} formatAsMoney
          overrides={overrides} setOverrides={setOverrides}
        />
        <EditableKpi
          id="profit" label="صافي الأرباح" icon="📈" color="#27ae60"
          actualValue={actualProfit} displayValue={displayProfit} formatAsMoney
          overrides={overrides} setOverrides={setOverrides}
        />
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderBottom: `4px solid ${pendingInstapayApprovals > 0 ? '#e74c3c' : '#27ae60'}` }}>
          <p style={{ margin: '0 0 6px', color: '#888', fontSize: 13 }}>InstaPay معلق</p>
          <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: pendingInstapayApprovals > 0 ? '#e74c3c' : '#27ae60' }}>⏳ {pendingInstapayApprovals}</p>
        </div>
      </div>

      {Object.keys(overrides).length > 0 && (
        <div style={{ background: '#fffbe6', border: '1px solid #ffe082', borderRadius: 10, padding: '10px 16px', marginBottom: 20, fontSize: 13, color: '#8a6100' }}>
          ⚠️ بعض القيم أعلاه مُعدّلة يدوياً ولا تعكس البيانات الفعلية المحسوبة من الطلبات. اضغط "إرجاع القيمة الفعلية" لإلغاء التعديل.
        </div>
      )}

      {lowStockProducts?.length > 0 && (
        <div style={{ background: '#fff5f5', border: '1px solid #ffcccc', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 14px', color: '#c0392b' }}>🔴 تنبيه: مخزون منخفض (أقل من 5 قطع)</h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {lowStockProducts.map(p => (
              <div key={p._id} style={{ background: '#fff', border: '2px solid #e74c3c', borderRadius: 10, padding: '10px 14px', display: 'flex', gap: 10, alignItems: 'center' }}>
                {p.images?.[0]?.url && <img src={p.images[0].url} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />}
                <div><p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{p.name?.ar}</p><p style={{ margin: 0, fontSize: 12, color: '#e74c3c', fontWeight: 700 }}>{p.stock} قطع فقط!</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div style={card}>
          <h3 style={cT}>💳 InstaPay — بانتظار الموافقة</h3>
          {recentOrders?.filter(o => o.paymentMethod === 'instapay' && o.paymentStatus === 'pending').length === 0
            ? <p style={{ color: '#aaa', fontSize: 14 }}>لا توجد طلبات معلقة ✓</p>
            : recentOrders.filter(o => o.paymentMethod === 'instapay' && o.paymentStatus === 'pending').map(o => (
              <div key={o._id} style={{ borderBottom: '1px solid #f0e8e8', paddingBottom: 12, marginBottom: 12 }}>
                <p style={{ margin: '0 0 4px', fontWeight: 600 }}>{o.customer?.name}</p>
                <p style={{ margin: '0 0 8px', fontSize: 13, color: '#666' }}>{o.total} ج.م</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => approve(o._id, 'approved')} style={{ padding: '6px 14px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>✓ موافقة</button>
                  <button onClick={() => approve(o._id, 'rejected')} style={{ padding: '6px 14px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>✗ رفض</button>
                </div>
              </div>
            ))}
        </div>
        <div style={card}>
          <h3 style={cT}>🔥 الأكثر مبيعاً</h3>
          {topProducts?.map((p, i) => (
            <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ background: '#f8ad9d', color: '#6D1A36', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>#{i + 1}</span>
              {p.images?.[0]?.url && <img src={p.images[0].url} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} />}
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{p.name?.ar}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{p.sold} مبيعة</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ ...cT, margin: 0 }}>📋 آخر الطلبات</h3>
          <Link to="../orders" style={{ color: '#6D1A36', fontSize: 13, textDecoration: 'none' }}>عرض الكل ←</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead><tr style={{ background: '#f8f9fa' }}>
              {['العميل', 'الإجمالي', 'الدفع', 'الحالة', 'التاريخ'].map(h => <th key={h} style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 600, borderBottom: '1px solid #eee' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {recentOrders?.map(o => (
                <tr key={o._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '10px 12px' }}>{o.customer?.name}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#27ae60' }}>{o.total} ج.م</td>
                  <td style={{ padding: '10px 12px' }}><span style={{ background: '#e8f5e9', color: '#333', padding: '3px 8px', borderRadius: 10, fontSize: 12 }}>{o.paymentMethod}</span></td>
                  <td style={{ padding: '10px 12px' }}><Badge s={o.status} /></td>
                  <td style={{ padding: '10px 12px', color: '#888' }}>{new Date(o.createdAt).toLocaleDateString('ar-EG')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <button onClick={() => exp('excel')} style={{ padding: '10px 20px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>📊 تصدير Excel</button>
        <button onClick={() => exp('pdf')} style={{ padding: '10px 20px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>📄 تصدير PDF</button>
      </div>
    </AdminLayout>
  );
}
const card = { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0e8e8' };
const cT = { color: '#6D1A36', borderRight: '4px solid #f8ad9d', paddingRight: 10, margin: '0 0 16px' };
