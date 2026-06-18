import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard, updateOrderPayment, exportReport } from '../../api';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';

const SC = { 'قيد المراجعة': { bg: '#fff3e0', c: '#ef6c00' }, 'جاري التجهيز': { bg: '#e3f2fd', c: '#1565c0' }, 'تم الشحن': { bg: '#e8eaf6', c: '#3949ab' }, 'تم التسليم': { bg: '#e8f5e9', c: '#2e7d32' }, 'مرتجع': { bg: '#ffebee', c: '#c62828' } };

function Badge({ s }) {
  const x = SC[s] || { bg: '#f5f5f5', c: '#333' };
  return <span style={{ background: x.bg, color: x.c, padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{s}</span>;
}

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  return (
    <AdminLayout>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { t: 'إجمالي الطلبات', v: salesStats.orderCount || 0, i: '📦', c: '#1a3a5c' },
          { t: 'إجمالي الإيرادات', v: `${(salesStats.totalRevenue || 0).toFixed(0)} ج.م`, i: '💰', c: '#3498db' },
          { t: 'صافي الأرباح', v: `${(profitStats?.totalProfit || 0).toFixed(0)} ج.م`, i: '📈', c: '#27ae60' },
          { t: 'InstaPay معلق', v: pendingInstapayApprovals, i: '⏳', c: pendingInstapayApprovals > 0 ? '#e74c3c' : '#27ae60' },
        ].map(k => (
          <div key={k.t} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderBottom: `4px solid ${k.c}` }}>
            <p style={{ margin: '0 0 6px', color: '#888', fontSize: 13 }}>{k.t}</p>
            <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: k.c }}>{k.i} {k.v}</p>
          </div>
        ))}
      </div>

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
              <span style={{ background: '#f8ad9d', color: '#1a3a5c', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>#{i + 1}</span>
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
          <Link to="../orders" style={{ color: '#1a3a5c', fontSize: 13, textDecoration: 'none' }}>عرض الكل ←</Link>
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
const cT = { color: '#1a3a5c', borderRight: '4px solid #f8ad9d', paddingRight: 10, margin: '0 0 16px' };
