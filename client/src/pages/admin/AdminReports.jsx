import { useState } from 'react';
import { exportReport, getDashboard } from '../../api';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import { useEffect } from 'react';

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getDashboard().then(res => setData(res.data.data)).catch(() => {});
  }, []);

  const handleExport = async (format) => {
    setExporting(true);
    try {
      const res = await exportReport(format, startDate, endDate);
      const ext = format === 'excel' ? 'xlsx' : 'pdf';
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `abc-alhawi-report-${new Date().toISOString().split('T')[0]}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`تم تصدير الـ ${format.toUpperCase()} ✓`);
    } catch {
      toast.error('فشل التصدير');
    }
    setExporting(false);
  };

  const { salesStats, profitStats, topProducts, slowProducts } = data || {};

  return (
    <AdminLayout>
      <h2 style={{ color: '#1a3a5c', marginBottom: 24 }}>📈 التقارير والتحليلات</h2>

      {/* KPI Summary */}
      {salesStats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'إجمالي الطلبات', value: salesStats.orderCount || 0, color: '#1a3a5c', icon: '📦' },
            { label: 'إجمالي الإيرادات', value: `${(salesStats.totalRevenue || 0).toFixed(0)} ج.م`, color: '#3498db', icon: '💰' },
            { label: 'صافي الأرباح', value: `${(profitStats?.totalProfit || 0).toFixed(0)} ج.م`, color: '#27ae60', icon: '📈' },
            { label: 'متوسط قيمة الطلب', value: `${(salesStats.avgOrder || 0).toFixed(0)} ج.م`, color: '#9b59b6', icon: '🛒' },
          ].map(k => (
            <div key={k.label} style={{ background: '#fff', borderRadius: 12, padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderBottom: `4px solid ${k.color}` }}>
              <p style={{ margin: '0 0 6px', color: '#888', fontSize: 13 }}>{k.label}</p>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 700, color: k.color }}>{k.icon} {k.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Sales vs Cost ratio */}
      {salesStats && profitStats && (
        <div style={{ background: '#fff', borderRadius: 12, padding: '24px', marginBottom: 24, boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#1a3a5c' }}>📊 نسبة المبيعات / التكلفة / الأرباح</h3>
          {(() => {
            const revenue = salesStats.totalRevenue || 0;
            const profit = profitStats.totalProfit || 0;
            const cost = profitStats.totalCost || 0;
            const total = revenue || 1;
            const revenueW = Math.round((revenue / total) * 100);
            const costW = Math.round((cost / total) * 100);
            const profitW = Math.round((profit / total) * 100);
            return (
              <div>
                {[
                  { label: 'الإيرادات الكلية', value: revenue, pct: revenueW, color: '#3498db' },
                  { label: 'التكلفة الكلية', value: cost, pct: costW, color: '#e74c3c' },
                  { label: 'صافي الأرباح', value: profit, pct: profitW, color: '#27ae60' },
                ].map(b => (
                  <div key={b.label} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 14 }}>
                      <span style={{ fontWeight: 600 }}>{b.label}</span>
                      <span style={{ color: b.color, fontWeight: 700 }}>{b.value.toFixed(0)} ج.م ({b.pct}%)</span>
                    </div>
                    <div style={{ background: '#f0f2f5', borderRadius: 6, height: 12, overflow: 'hidden' }}>
                      <div style={{ width: `${b.pct}%`, background: b.color, height: '100%', borderRadius: 6, transition: 'width 0.8s ease' }} />
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Best sellers */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#1a3a5c', borderRight: '4px solid #f8ad9d', paddingRight: 10 }}>🔥 الأكثر مبيعاً</h3>
          {topProducts?.map((p, i) => (
            <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ background: '#f8ad9d', color: '#1a3a5c', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                  {i + 1}
                </span>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{p.name?.ar}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{p.sold} قطعة مباعة</p>
                </div>
              </div>
              <span style={{ color: '#27ae60', fontWeight: 700, fontSize: 14 }}>
                +{(p.sellingPrice - p.costPrice).toFixed(0)} ج.م ربح
              </span>
            </div>
          ))}
        </div>

        {/* Slow movers */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 16px', color: '#1a3a5c', borderRight: '4px solid #e74c3c', paddingRight: 10 }}>🐌 منتجات بطيئة الحركة</h3>
          {slowProducts?.length === 0 ? (
            <p style={{ color: '#aaa', fontSize: 14 }}>لا توجد منتجات بطيئة — ممتاز! 🎉</p>
          ) : (
            slowProducts?.map(p => (
              <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, padding: '8px 0', borderBottom: '1px solid #f5f5f5' }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14 }}>{p.name?.ar}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#e74c3c' }}>0 مبيعات — {p.stock} قطعة في المخزن</p>
                </div>
                <span style={{ fontSize: 12, color: '#888' }}>منذ {Math.ceil((Date.now() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24))} يوم</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Export section */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
        <h3 style={{ margin: '0 0 16px', color: '#1a3a5c' }}>📤 تصدير التقارير</h3>
        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={labelStyle}>من تاريخ</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>إلى تاريخ</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} />
          </div>
          <button
            onClick={() => handleExport('excel')}
            disabled={exporting}
            style={{ padding: '11px 22px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
          >
            📊 {exporting ? 'جاري التصدير...' : 'تصدير Excel'}
          </button>
          <button
            onClick={() => handleExport('pdf')}
            disabled={exporting}
            style={{ padding: '11px 22px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
          >
            📄 {exporting ? 'جاري التصدير...' : 'تصدير PDF'}
          </button>
        </div>
        <p style={{ fontSize: 12, color: '#aaa', marginTop: 12 }}>
          * إذا تُركت حقول التاريخ فارغة، سيتم تصدير كل البيانات
        </p>
      </div>
    </AdminLayout>
  );
}

const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 600, color: '#555', fontSize: 13 };
const inputStyle = { padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fafafa' };
