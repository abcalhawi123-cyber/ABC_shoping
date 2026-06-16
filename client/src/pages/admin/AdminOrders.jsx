import { useState, useEffect } from 'react';
import { getAdminOrders, updateOrderStatus, updateOrderPayment } from '../../api';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';

const ORDER_STATUSES = ['قيد المراجعة', 'جاري التجهيز', 'تم الشحن', 'تم التسليم', 'مرتجع'];
const STATUS_COLORS = {
  'قيد المراجعة': { bg: '#fff3e0', color: '#ef6c00' },
  'جاري التجهيز': { bg: '#e3f2fd', color: '#1565c0' },
  'تم الشحن': { bg: '#e8eaf6', color: '#3949ab' },
  'تم التسليم': { bg: '#e8f5e9', color: '#2e7d32' },
  'مرتجع': { bg: '#ffebee', color: '#c62828' },
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null); // order detail modal
  const [filters, setFilters] = useState({ status: '', paymentMethod: '', paymentStatus: '' });

  const fetchOrders = async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const { data } = await getAdminOrders(params);
      setOrders(data.data);
      setPagination(data.pagination);
    } catch {
      toast.error('فشل تحميل الطلبات');
    }
    setLoading(false);
  };

  useEffect(() => { fetchOrders(1); }, [filters]);

  const handleStatusChange = async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, { status });
      toast.success(`تم التحديث إلى: ${status}`);
      fetchOrders(pagination.page);
      if (selected?._id === orderId) setSelected(prev => ({ ...prev, status }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'حدث خطأ');
    }
  };

  const handlePaymentAction = async (orderId, paymentStatus) => {
    try {
      await updateOrderPayment(orderId, { paymentStatus });
      toast.success(paymentStatus === 'approved' ? '✓ تمت الموافقة على الدفع' : 'تم رفض الدفع');
      fetchOrders(pagination.page);
      if (selected?._id === orderId) setSelected(prev => ({ ...prev, paymentStatus }));
    } catch {
      toast.error('حدث خطأ');
    }
  };

  return (
    <AdminLayout>
      <h2 style={{ color: '#1a3a5c', marginBottom: 20 }}>🛒 إدارة الطلبات</h2>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} style={selectStyle}>
          <option value="">كل الحالات</option>
          {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.paymentMethod} onChange={e => setFilters({ ...filters, paymentMethod: e.target.value })} style={selectStyle}>
          <option value="">كل طرق الدفع</option>
          <option value="cod">الدفع عند الاستلام</option>
          <option value="instapay">InstaPay</option>
          <option value="card">بطاقة</option>
        </select>
        <select value={filters.paymentStatus} onChange={e => setFilters({ ...filters, paymentStatus: e.target.value })} style={selectStyle}>
          <option value="">كل حالات الدفع</option>
          <option value="pending">قيد الانتظار</option>
          <option value="approved">مدفوع</option>
          <option value="rejected">مرفوض</option>
        </select>
        <button onClick={() => setFilters({ status: '', paymentMethod: '', paymentStatus: '' })} style={btnReset}>
          إعادة تعيين
        </button>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>جاري التحميل...</div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {['#', 'العميل', 'الإجمالي', 'الدفع', 'حالة الدفع', 'حالة الطلب', 'التاريخ', 'تفاصيل'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'right', color: '#2c3e50', fontWeight: 600, borderBottom: '2px solid #eee', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((order, idx) => (
                  <tr key={order._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '10px 14px', color: '#aaa', fontSize: 12 }}>{idx + 1}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <p style={{ margin: 0, fontWeight: 600 }}>{order.customer?.name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{order.customer?.phone}</p>
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#1a3a5c' }}>{order.total} ج.م</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ background: '#f0f4ff', color: '#3949ab', padding: '3px 8px', borderRadius: 10, fontSize: 12 }}>
                        {order.paymentMethod === 'cod' ? 'كاش' : order.paymentMethod === 'instapay' ? 'InstaPay' : 'بطاقة'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {order.paymentMethod === 'instapay' && order.paymentStatus === 'pending' ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => handlePaymentAction(order._id, 'approved')} style={btnSmallGreen}>✓</button>
                          <button onClick={() => handlePaymentAction(order._id, 'rejected')} style={btnSmallRed}>✗</button>
                        </div>
                      ) : (
                        <span style={{
                          background: order.paymentStatus === 'approved' ? '#e8f5e9' : order.paymentStatus === 'rejected' ? '#ffebee' : '#fff3e0',
                          color: order.paymentStatus === 'approved' ? '#27ae60' : order.paymentStatus === 'rejected' ? '#e74c3c' : '#ef6c00',
                          padding: '3px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600,
                        }}>
                          {order.paymentStatus === 'approved' ? 'مدفوع' : order.paymentStatus === 'rejected' ? 'مرفوض' : 'انتظار'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <select
                        value={order.status}
                        onChange={e => handleStatusChange(order._id, e.target.value)}
                        style={{
                          padding: '5px 8px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                          border: `2px solid ${STATUS_COLORS[order.status]?.color || '#ddd'}`,
                          background: STATUS_COLORS[order.status]?.bg || '#f5f5f5',
                          color: STATUS_COLORS[order.status]?.color || '#333',
                          cursor: 'pointer',
                        }}
                      >
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#888', fontSize: 12 }}>
                      {new Date(order.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <button onClick={() => setSelected(order)} style={btnDetails}>عرض</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: '16px' }}>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => fetchOrders(p)} style={{
                  padding: '6px 12px', borderRadius: 6,
                  background: p === pagination.page ? '#1a3a5c' : '#fff',
                  color: p === pagination.page ? '#fff' : '#333',
                  border: '1px solid #ddd', cursor: 'pointer',
                }}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: '#1a3a5c' }}>تفاصيل الطلب</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>✕</button>
            </div>

            {/* Customer info */}
            <div style={detailSection}>
              <h4 style={detailTitle}>👤 بيانات العميل</h4>
              <p><strong>الاسم:</strong> {selected.customer?.name}</p>
              <p><strong>البريد:</strong> {selected.customer?.email}</p>
              <p><strong>الهاتف:</strong> {selected.customer?.phone}</p>
              <p><strong>النوع:</strong> {selected.isGuestOrder ? 'زائر (بدون حساب)' : 'مسجل'}</p>
            </div>

            {/* Shipping */}
            <div style={detailSection}>
              <h4 style={detailTitle}>🚚 عنوان الشحن</h4>
              <p>{selected.shippingAddress?.governorate?.ar} — {selected.shippingAddress?.city} — {selected.shippingAddress?.street}</p>
              <p><strong>التوصيل المتوقع:</strong> {selected.estimatedDeliveryDays?.min}–{selected.estimatedDeliveryDays?.max} أيام</p>
            </div>

            {/* Items */}
            <div style={detailSection}>
              <h4 style={detailTitle}>📦 المنتجات</h4>
              {selected.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span>{item.name?.ar} × {item.quantity}</span>
                  <span style={{ fontWeight: 600 }}>{(item.unitPrice * item.quantity).toFixed(0)} ج.م</span>
                </div>
              ))}
              <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span>المجموع الفرعي</span><span>{selected.subtotal} ج.م</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                <span>الشحن</span><span>{selected.shippingFee} ج.م</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginTop: 6, color: '#1a3a5c' }}>
                <span>الإجمالي</span><span>{selected.total} ج.م</span>
              </div>
            </div>

            {/* InstaPay screenshot */}
            {selected.paymentMethod === 'instapay' && (
              <div style={detailSection}>
                <h4 style={detailTitle}>💳 InstaPay</h4>
                <p><strong>كود العملية:</strong> {selected.instapayTransactionId}</p>
                {selected.instapayScreenshotUrl && (
                  <a href={selected.instapayScreenshotUrl} target="_blank" rel="noopener noreferrer">
                    <img src={selected.instapayScreenshotUrl} alt="transfer screenshot" style={{ width: '100%', borderRadius: 8, border: '1px solid #ddd', marginTop: 8 }} />
                  </a>
                )}
              </div>
            )}

            {/* Status history */}
            {selected.statusHistory?.length > 0 && (
              <div style={detailSection}>
                <h4 style={detailTitle}>📋 سجل الحالة</h4>
                {selected.statusHistory.map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ color: STATUS_COLORS[h.status]?.color || '#333' }}>{h.status}</span>
                    <span style={{ color: '#aaa' }}>{new Date(h.changedAt).toLocaleString('ar-EG')}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Return eligibility */}
            <div style={{ background: '#f9f9f9', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#555' }}>
              {selected.canReturn !== false
                ? '✅ هذا الطلب مؤهل للإرجاع (15 يوم من تاريخ الطلب)'
                : '❌ انتهت مدة الإرجاع أو تم تطبيقه مسبقاً'}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

const selectStyle = { padding: '9px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fff', cursor: 'pointer' };
const btnReset = { padding: '9px 14px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 13, color: '#555' };
const btnSmallGreen = { padding: '4px 8px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 13, fontWeight: 700 };
const btnSmallRed = { padding: '4px 8px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 13, fontWeight: 700 };
const btnDetails = { padding: '5px 12px', background: '#e3f2fd', color: '#1565c0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 };
const detailSection = { background: '#fafafa', borderRadius: 10, padding: '14px 16px', marginBottom: 14 };
const detailTitle = { margin: '0 0 10px', color: '#1a3a5c', fontSize: 15 };
