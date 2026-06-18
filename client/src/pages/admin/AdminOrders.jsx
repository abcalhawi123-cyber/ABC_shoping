import { useState, useEffect } from 'react';
import { getAdminOrders, updateOrderStatus, updateOrderPayment } from '../../api';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';

const ST = ['قيد المراجعة','جاري التجهيز','تم الشحن','تم التسليم','مرتجع'];
const SC = { 'قيد المراجعة':{bg:'#fff3e0',c:'#ef6c00'}, 'جاري التجهيز':{bg:'#e3f2fd',c:'#1565c0'}, 'تم الشحن':{bg:'#e8eaf6',c:'#3949ab'}, 'تم التسليم':{bg:'#e8f5e9',c:'#2e7d32'}, 'مرتجع':{bg:'#ffebee',c:'#c62828'} };

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);
  const [filters, setFilters] = useState({ status: '', paymentMethod: '', paymentStatus: '' });

  const load = (page = 1) => {
    setLoading(true);
    const p = { page, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) };
    getAdminOrders(p).then(r => { setOrders(r.data.data); setPagination(r.data.pagination); }).catch(() => toast.error('فشل التحميل')).finally(() => setLoading(false));
  };
  useEffect(() => { load(1); }, [filters]);

  const changeStatus = async (id, status) => {
    try { await updateOrderStatus(id, { status }); toast.success(`تم التحديث: ${status}`); load(pagination.page); if (sel?._id === id) setSel(p => ({ ...p, status })); }
    catch (err) { toast.error(err.response?.data?.message || 'حدث خطأ'); }
  };

  const changePay = async (id, paymentStatus) => {
    try { await updateOrderPayment(id, { paymentStatus }); toast.success(paymentStatus === 'approved' ? '✓ تمت الموافقة' : 'تم الرفض'); load(pagination.page); }
    catch { toast.error('حدث خطأ'); }
  };

  const S = (k, label, opts) => (
    <select value={filters[k]} onChange={e => setFilters({ ...filters, [k]: e.target.value })} style={{ padding: '9px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fff', cursor: 'pointer' }}>
      <option value="">{label}</option>
      {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );

  return (
    <AdminLayout>
      <h2 style={{ color: '#1a3a5c', marginBottom: 20 }}>🛒 إدارة الطلبات</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {S('status', 'كل الحالات', ST.map(s => ({ v: s, l: s })))}
        {S('paymentMethod', 'كل طرق الدفع', [{ v: 'cod', l: 'كاش' }, { v: 'instapay', l: 'InstaPay' }, { v: 'card', l: 'بطاقة' }])}
        {S('paymentStatus', 'كل حالات الدفع', [{ v: 'pending', l: 'انتظار' }, { v: 'approved', l: 'مدفوع' }, { v: 'rejected', l: 'مرفوض' }])}
        <button onClick={() => setFilters({ status: '', paymentMethod: '', paymentStatus: '' })} style={{ padding: '9px 14px', background: '#f5f5f5', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>إعادة تعيين</button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '60px 0' }}>جاري التحميل...</div> : (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead><tr style={{ background: '#f8f9fa' }}>
                {['#','العميل','الإجمالي','الدفع','حالة الدفع','حالة الطلب','التاريخ','تفاصيل'].map(h => <th key={h} style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600, borderBottom: '2px solid #eee', whiteSpace: 'nowrap' }}>{h}</th>)}
              </tr></thead>
              <tbody>
                {orders.map((o, idx) => (
                  <tr key={o._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                    <td style={{ padding: '10px 14px', color: '#aaa', fontSize: 12 }}>{idx + 1}</td>
                    <td style={{ padding: '10px 14px' }}><p style={{ margin: 0, fontWeight: 600 }}>{o.customer?.name}</p><p style={{ margin: 0, fontSize: 12, color: '#888' }}>{o.customer?.phone}</p></td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#1a3a5c' }}>{o.total} ج.م</td>
                    <td style={{ padding: '10px 14px' }}><span style={{ background: '#f0f4ff', color: '#3949ab', padding: '3px 8px', borderRadius: 10, fontSize: 12 }}>{o.paymentMethod === 'cod' ? 'كاش' : o.paymentMethod === 'instapay' ? 'InstaPay' : 'بطاقة'}</span></td>
                    <td style={{ padding: '10px 14px' }}>
                      {o.paymentMethod === 'instapay' && o.paymentStatus === 'pending' ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => changePay(o._id, 'approved')} style={{ padding: '4px 8px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>✓</button>
                          <button onClick={() => changePay(o._id, 'rejected')} style={{ padding: '4px 8px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>✗</button>
                        </div>
                      ) : (
                        <span style={{ background: o.paymentStatus === 'approved' ? '#e8f5e9' : o.paymentStatus === 'rejected' ? '#ffebee' : '#fff3e0', color: o.paymentStatus === 'approved' ? '#27ae60' : o.paymentStatus === 'rejected' ? '#e74c3c' : '#ef6c00', padding: '3px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>
                          {o.paymentStatus === 'approved' ? 'مدفوع' : o.paymentStatus === 'rejected' ? 'مرفوض' : 'انتظار'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <select value={o.status} onChange={e => changeStatus(o._id, e.target.value)} style={{ padding: '5px 8px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: `2px solid ${SC[o.status]?.c || '#ddd'}`, background: SC[o.status]?.bg || '#f5f5f5', color: SC[o.status]?.c || '#333', cursor: 'pointer' }}>
                        {ST.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#888', fontSize: 12 }}>{new Date(o.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td style={{ padding: '10px 14px' }}><button onClick={() => setSel(o)} style={{ padding: '5px 12px', background: '#e3f2fd', color: '#1565c0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>عرض</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.pages > 1 && <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: 16 }}>{Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => <button key={p} onClick={() => load(p)} style={{ padding: '6px 12px', borderRadius: 6, background: p === pagination.page ? '#1a3a5c' : '#fff', color: p === pagination.page ? '#fff' : '#333', border: '1px solid #ddd', cursor: 'pointer' }}>{p}</button>)}</div>}
        </div>
      )}

      {sel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: '#1a3a5c' }}>تفاصيل الطلب</h3>
              <button onClick={() => setSel(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer' }}>✕</button>
            </div>
            <div style={ds}><h4 style={dt}>👤 العميل</h4><p><strong>الاسم:</strong> {sel.customer?.name}</p><p><strong>البريد:</strong> {sel.customer?.email}</p><p><strong>الهاتف:</strong> {sel.customer?.phone}</p><p><strong>النوع:</strong> {sel.isGuestOrder ? 'زائر' : 'مسجل'}</p></div>
            <div style={ds}><h4 style={dt}>🚚 عنوان الشحن</h4><p>{sel.shippingAddress?.governorate?.ar} — {sel.shippingAddress?.city} — {sel.shippingAddress?.street}</p><p><strong>التوصيل:</strong> {sel.estimatedDeliveryDays?.min}–{sel.estimatedDeliveryDays?.max} أيام</p></div>
            <div style={ds}>
              <h4 style={dt}>📦 المنتجات</h4>
              {sel.items?.map((item, i) => <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}><span>{item.name?.ar} × {item.quantity}</span><span style={{ fontWeight: 600 }}>{(item.unitPrice * item.quantity).toFixed(0)} ج.م</span></div>)}
              <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16 }}><span>الإجمالي</span><span style={{ color: '#1a3a5c' }}>{sel.total} ج.م</span></div>
            </div>
            {sel.paymentMethod === 'instapay' && (
              <div style={ds}>
                <h4 style={dt}>💳 InstaPay</h4>
                <p><strong>كود العملية:</strong> {sel.instapayTransactionId}</p>
                {sel.instapayScreenshotUrl && <a href={sel.instapayScreenshotUrl} target="_blank" rel="noopener noreferrer"><img src={sel.instapayScreenshotUrl} alt="screenshot" style={{ width: '100%', borderRadius: 8, border: '1px solid #ddd', marginTop: 8 }} /></a>}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
const ds = { background: '#fafafa', borderRadius: 10, padding: '14px 16px', marginBottom: 14 };
const dt = { margin: '0 0 10px', color: '#1a3a5c', fontSize: 15 };
