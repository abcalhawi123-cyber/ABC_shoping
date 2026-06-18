import { useState, useEffect } from 'react';
import { getDashboard, exportReport } from '../../api';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => { getDashboard().then(r => setData(r.data.data)).catch(() => {}); }, []);

  const exp = async fmt => {
    setBusy(true);
    try {
      const r = await exportReport(fmt, start, end);
      const ext = fmt === 'excel' ? 'xlsx' : 'pdf';
      const url = URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement('a'); a.href = url; a.download = `abc-alhawi-report-${new Date().toISOString().split('T')[0]}.${ext}`; a.click();
      URL.revokeObjectURL(url); toast.success(`تم تصدير ${fmt.toUpperCase()} ✓`);
    } catch { toast.error('فشل التصدير'); }
    setBusy(false);
  };

  const { salesStats, profitStats, topProducts, slowProducts } = data || {};

  return (
    <AdminLayout>
      <h2 style={{ color: '#1a3a5c', marginBottom: 24 }}>📈 التقارير والتحليلات</h2>

      {salesStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { l: 'إجمالي الطلبات', v: salesStats.orderCount || 0, c: '#1a3a5c', i: '📦' },
            { l: 'إجمالي الإيرادات', v: `${(salesStats.totalRevenue || 0).toFixed(0)} ج.م`, c: '#3498db', i: '💰' },
            { l: 'صافي الأرباح', v: `${(profitStats?.totalProfit || 0).toFixed(0)} ج.م`, c: '#27ae60', i: '📈' },
            { l: 'متوسط الطلب', v: `${(salesStats.avgOrder || 0).toFixed(0)} ج.م`, c: '#9b59b6', i: '🛒' },
          ].map(k => (
            <div key={k.l} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderBottom: `4px solid ${k.c}` }}>
              <p style={{ margin: '0 0 6px', color: '#888', fontSize: 13 }}>{k.l}</p>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: k.c }}>{k.i} {k.v}</p>
            </div>
          ))}
        </div>
      )}

      {salesStats && profitStats && (
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#1a3a5c' }}>📊 نسبة المبيعات / التكلفة / الأرباح</h3>
          {(() => {
            const rev = salesStats.totalRevenue || 0, profit = profitStats.totalProfit || 0, cost = profitStats.totalCost || 0, total = rev || 1;
            return [
              { l: 'الإيرادات', v: rev, pct: Math.round(rev / total * 100), c: '#3498db' },
              { l: 'التكلفة', v: cost, pct: Math.round(cost / total * 100), c: '#e74c3c' },
              { l: 'الأرباح', v: profit, pct: Math.round(profit / total * 100), c: '#27ae60' },
            ].map(b => (
              <div key={b.l} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 14 }}>
                  <span style={{ fontWeight: 600 }}>{b.l}</span>
                  <span style={{ color: b.c, fontWeight: 700 }}>{b.v.toFixed(0)} ج.م ({b.pct}%)</span>
                </div>
                <div style={{ background: '#f0f2f5', borderRadius: 6, height: 12, overflow: 'hidden' }}>
                  <div style={{ width: `${b.pct}%`, background: b.c, height: '100%', borderRadius: 6 }} />
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        <div style={card}>
          <h3 style={cT}>🔥 الأكثر مبيعاً</h3>
          {topProducts?.map((p, i) => (
            <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f5f5f5' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ background: '#f8ad9d', color: '#1a3a5c', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>#{i + 1}</span>
                <div><p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{p.name?.ar}</p><p style={{ margin: 0, fontSize: 12, color: '#888' }}>{p.sold} مبيعة</p></div>
              </div>
              <span style={{ color: '#27ae60', fontWeight: 700, fontSize: 14 }}>+{(p.sellingPrice - p.costPrice).toFixed(0)} ج.م</span>
            </div>
          ))}
        </div>
        <div style={card}>
          <h3 style={{ ...cT, borderRightColor: '#e74c3c' }}>🐌 بطيئة الحركة</h3>
          {!slowProducts?.length ? <p style={{ color: '#aaa', fontSize: 14 }}>لا توجد منتجات بطيئة 🎉</p> : slowProducts.map(p => (
            <div key={p._id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f5f5f5' }}>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{p.name?.ar}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#e74c3c' }}>0 مبيعات — {p.stock} قطعة</p>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <h3 style={{ margin: '0 0 16px', color: '#1a3a5c' }}>📤 تصدير التقارير</h3>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#555', fontSize: 13 }}>من تاريخ</label><input type="date" value={start} onChange={e => setStart(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fafafa' }} /></div>
          <div><label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#555', fontSize: 13 }}>إلى تاريخ</label><input type="date" value={end} onChange={e => setEnd(e.target.value)} style={{ padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fafafa' }} /></div>
          <button onClick={() => exp('excel')} disabled={busy} style={{ padding: '11px 22px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>📊 {busy ? '...' : 'تصدير Excel'}</button>
          <button onClick={() => exp('pdf')} disabled={busy} style={{ padding: '11px 22px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>📄 {busy ? '...' : 'تصدير PDF'}</button>
        </div>
        <p style={{ fontSize: 12, color: '#aaa', marginTop: 12 }}>* إذا تُركت حقول التاريخ فارغة، سيتم تصدير كل البيانات</p>
      </div>
    </AdminLayout>
  );
}
const card = { background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' };
const cT = { margin: '0 0 16px', color: '#1a3a5c', borderRight: '4px solid #f8ad9d', paddingRight: 10 };
