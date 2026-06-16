import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboard, updateOrderPayment, exportReport } from '../../api';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await getDashboard();
      setData(res.data.data);
    } catch {
      toast.error('فشل تحميل البيانات');
    }
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handlePaymentAction = async (orderId, status) => {
    try {
      await updateOrderPayment(orderId, { paymentStatus: status });
      toast.success(status === 'approved' ? 'تمت الموافقة ✓' : 'تم الرفض');
      fetch();
    } catch {
      toast.error('حدث خطأ');
    }
  };

  const handleExport = async (format) => {
    try {
      const res = await exportReport(format);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `abc-alhawi-report.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      a.click();
    } catch {
      toast.error('فشل التصدير');
    }
  };

  if (loading) return <AdminLayout><div style={{ padding: 40, textAlign: 'center' }}>جاري التحميل...</div></AdminLayout>;
  if (!data) return null;

  const { salesStats, profitStats, lowStockProducts, recentOrders, topProducts, slowProducts, pendingInstapayApprovals } = data;

  return (
    <AdminLayout>
      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        <StatBox title="إجمالي الطلبات" value={salesStats.orderCount || 0} icon="📦" />
        <StatBox title="إجمالي الإيرادات" value={`${(salesStats.totalRevenue || 0).toFixed(0)} ج.م`} icon="💰" />
        <StatBox title="صافي الأرباح" value={`${(profitStats.totalProfit || 0).toFixed(0)} ج.م`} icon="📈" color="#27ae60" />
        <StatBox
          title="InstaPay قيد المراجعة"
          value={pendingInstapayApprovals}
          icon="⏳"
          color={pendingInstapayApprovals > 0 ? '#e74c3c' : '#27ae60'}
        />
      </div>

      {/* Low Stock Alert */}
      {lowStockProducts.length > 0 && (
        <div style={{ background: '#fff5f5', border: '1px solid #ffcccc', borderRadius: 12, padding: 20, marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 14px', color: '#c0392b', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ background: '#e74c3c', color: '#fff', borderRadius: '50%', width: 24, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>!</span>
            تنبيه: منتجات بمخزون منخفض (أقل من 5 قطع)
          </h3>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {lowStockProducts.map(p => (
              <div key={p._id} style={{ background: '#fff', border: '2px solid #e74c3c', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                {p.images?.[0]?.url && <img src={p.images[0].url} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />}
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#2c3e50' }}>{p.name?.ar}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#e74c3c', fontWeight: 700 }}>{p.stock} قطع فقط!</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
        {/* Pending InstaPay Orders */}
        <div style={cardStyle}>
          <h3 style={cardTitle}>💳 طلبات InstaPay — بانتظار الموافقة</h3>
          {recentOrders.filter(o => o.paymentMethod === 'instapay' && o.paymentStatus === 'pending').length === 0 ? (
            <p style={{ color: '#aaa', fontSize: 14 }}>لا توجد طلبات معلقة ✓</p>
          ) : (
            recentOrders
              .filter(o => o.paymentMethod === 'instapay' && o.paymentStatus === 'pending')
              .map(order => (
                <div key={order._id} style={{ borderBottom: '1px solid #f0e8e8', paddingBottom: 12, marginBottom: 12 }}>
                  <p style={{ margin: '0 0 4px', fontWeight: 600 }}>{order.customer?.name}</p>
                  <p style={{ margin: '0 0 8px', fontSize: 13, color: '#666' }}>{order.total} ج.م</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handlePaymentAction(order._id, 'approved')} style={btnGreen}>✓ موافقة</button>
                    <button onClick={() => handlePaymentAction(order._id, 'rejected')} style={btnRed}>✗ رفض</button>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Best Sellers */}
        <div style={cardStyle}>
          <h3 style={cardTitle}>🔥 الأكثر مبيعاً</h3>
          {topProducts.map((p, i) => (
            <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ fontWeight: 700, color: '#f8ad9d', width: 20 }}>#{i + 1}</span>
              {p.images?.[0]?.url && <img src={p.images[0].url} alt="" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} />}
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{p.name?.ar}</p>
                <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{p.sold} مبيعة — ربح: {(p.sellingPrice - p.costPrice).toFixed(0)} ج.م/قطعة</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Orders */}
      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ ...cardTitle, margin: 0 }}>📋 آخر الطلبات</h3>
          <Link to="../orders" style={{ color: '#1a3a5c', fontSize: 13, textDecoration: 'none' }}>عرض الكل ←</Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8f9fa' }}>
                {['العميل', 'الإجمالي', 'الدفع', 'الحالة', 'التاريخ'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'right', color: '#2c3e50', fontWeight: 600, borderBottom: '1px solid #eee' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map(order => (
                <tr key={order._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <td style={{ padding: '10px 12px' }}>{order.customer?.name}</td>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: '#27ae60' }}>{order.total} ج.م</td>
                  <td style={{ padding: '10px 12px' }}>
                    <span style={{ background: order.paymentMethod === 'instapay' ? '#e8f5e9' : '#e3f2fd', color: '#333', padding: '3px 8px', borderRadius: 10, fontSize: 12 }}>
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td style={{ padding: '10px 12px' }}>
                    <StatusBadge status={order.status} />
                  </td>
                  <td style={{ padding: '10px 12px', color: '#888' }}>{new Date(order.createdAt).toLocaleDateString('ar-EG')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export buttons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <button onClick={() => handleExport('excel')} style={btnExport('#27ae60')}>📊 تصدير Excel</button>
        <button onClick={() => handleExport('pdf')} style={btnExport('#e74c3c')}>📄 تصدير PDF</button>
      </div>
    </AdminLayout>
  );
}

function StatBox({ title, value, icon, color = '#1a3a5c' }) {
  return (
    <div style={{ background: '#fff', borderRadius: 12, padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', borderBottom: `4px solid ${color}` }}>
      <p style={{ margin: '0 0 6px', color: '#888', fontSize: 13 }}>{title}</p>
      <p style={{ margin: 0, fontSize: 26, fontWeight: 700, color }}>{icon} {value}</p>
    </div>
  );
}

const STATUS_COLORS = {
  'قيد المراجعة': { bg: '#fff3e0', color: '#ef6c00' },
  'جاري التجهيز': { bg: '#e3f2fd', color: '#1565c0' },
  'تم الشحن': { bg: '#e8eaf6', color: '#3949ab' },
  'تم التسليم': { bg: '#e8f5e9', color: '#2e7d32' },
  'مرتجع': { bg: '#ffebee', color: '#c62828' },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg: '#f5f5f5', color: '#333' };
  return (
    <span style={{ background: s.bg, color: s.color, padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
      {status}
    </span>
  );
}

const cardStyle = { background: '#fff', borderRadius: 12, padding: '20px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0e8e8' };
const cardTitle = { color: '#1a3a5c', borderRight: '4px solid #f8ad9d', paddingRight: 10, margin: '0 0 16px' };
const btnGreen = { padding: '6px 14px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 };
const btnRed = { padding: '6px 14px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 };
const btnExport = (bg) => ({ padding: '10px 20px', background: bg, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 });
