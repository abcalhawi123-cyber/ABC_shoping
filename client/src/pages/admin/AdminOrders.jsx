import { useState, useEffect } from 'react';
import { getAdminOrders, updateOrderStatus, updateOrderPayment } from '../../api';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';

const ST = ['قيد المراجعة','جاري التجهيز','تم الشحن','تم التسليم','مرتجع'];
const SC = {
  'قيد المراجعة':{bg:'#fff3e0',c:'#ef6c00'},
  'جاري التجهيز':{bg:'#e3f2fd',c:'#1565c0'},
  'تم الشحن':{bg:'#e8eaf6',c:'#3949ab'},
  'تم التسليم':{bg:'#e8f5e9',c:'#2e7d32'},
  'مرتجع':{bg:'#ffebee',c:'#c62828'},
};

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ status: '', paymentMethod: '', paymentStatus: '' });

  const load = (page = 1) => {
    setLoading(true);
    const p = { page, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) };
    if (search.trim()) p.search = search.trim();
    getAdminOrders(p)
      .then(r => { setOrders(r.data.data); setPagination(r.data.pagination); })
      .catch(() => toast.error('فشل التحميل'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, [filters]);

  const handleSearch = e => { e.preventDefault(); load(1); };

  const changeStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, { status });
      toast.success(`تم التحديث: ${status}`);
      load(pagination.page);
      if (sel?._id === id) setSel(p => ({ ...p, status }));
    } catch (err) { toast.error(err.response?.data?.message || 'حدث خطأ'); }
  };

  const changePay = async (id, paymentStatus) => {
    try {
      await updateOrderPayment(id, { paymentStatus });
      toast.success(paymentStatus === 'approved' ? '✓ تمت الموافقة' : 'تم الرفض');
      load(pagination.page);
      if (sel?._id === id) setSel(p => ({ ...p, paymentStatus }));
    } catch { toast.error('حدث خطأ'); }
  };

  return (
    <AdminLayout>
      <h2 style={{ color: '#1a3a5c', marginBottom: 20 }}>🛒 إدارة الطلبات
        <span style={{ fontSize: 14, fontWeight: 400, color: '#888', marginRight: 8 }}>({pagination.total || 0} طلب)</span>
      </h2>

      {/* Search + Filters */}
      <div style={{ background: '#fff', borderRadius: 12, padding: '16px 20px', marginBottom: 20, boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
        {/* Search bar */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث باسم العميل أو رقم الهاتف أو البريد..."
            style={{ flex: 1, padding: '10px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fafafa' }}
          />
          <button type="submit" style={{ padding: '10px 20px', background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
            🔍 بحث
          </button>
          {search && (
            <button type="button" onClick={() => { setSearch(''); load(1); }} style={{ padding: '10px 14px', background: '#f5f5f5', color: '#555', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
              ✕
            </button>
          )}
        </form>

        {/* Filter dropdowns */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} style={sel2}>
            <option value="">كل الحالات</option>
            {ST.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.paymentMethod} onChange={e => setFilters({ ...filters, paymentMethod: e.target.value })} style={sel2}>
            <option value="">كل طرق الدفع</option>
            <option value="cod">كاش عند الاستلام</option>
            <option value="instapay">InstaPay</option>
            <option value="card">بطاقة</option>
          </select>
          <select value={filters.paymentStatus} onChange={e => setFilters({ ...filters, paymentStatus: e.target.value })} style={sel2}>
            <option value="">كل حالات الدفع</option>
            <option value="pending">انتظار</option>
            <option value="approved">مدفوع</option>
            <option value="rejected">مرفوض</option>
          </select>
          <button
            onClick={() => { setFilters({ status: '', paymentMethod: '', paymentStatus: '' }); setSearch(''); }}
            style={{ padding: '9px 14px', background: '#fff5f5', color: '#e74c3c', border: '1px solid #ffcccc', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}
          >
            إعادة تعيين
          </button>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>جاري التحميل...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
          <p style={{ fontSize: 48 }}>📭</p>
          <p>لا توجد طلبات مطابقة</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {['#','العميل','الإجمالي','الدفع','حالة الدفع','حالة الطلب','التاريخ','تفاصيل'].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600, borderBottom: '2px solid #eee', whiteSpace: 'nowrap', color: '#2c3e50' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o, idx) => (
                  <tr key={o._id} style={{ borderBottom: '1px solid #f5f5f5', background: o.paymentMethod === 'instapay' && o.paymentStatus === 'pending' ? '#fffbf0' : '#fff' }}>
                    <td style={{ padding: '10px 14px', color: '#aaa', fontSize: 12 }}>{idx + 1}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <p style={{ margin: 0, fontWeight: 600 }}>{o.customer?.name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{o.customer?.phone}</p>
                    </td>
                    <td style={{ padding: '10px 14px', fontWeight: 700, color: '#1a3a5c' }}>{o.total} ج.م</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ background: '#f0f4ff', color: '#3949ab', padding: '3px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600 }}>
                        {o.paymentMethod === 'cod' ? '💵 كاش' : o.paymentMethod === 'instapay' ? '📱 InstaPay' : '💳 بطاقة'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      {o.paymentMethod === 'instapay' && o.paymentStatus === 'pending' ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button onClick={() => changePay(o._id, 'approved')} style={{ padding: '4px 8px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>✓</button>
                          <button onClick={() => changePay(o._id, 'rejected')} style={{ padding: '4px 8px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 5, cursor: 'pointer', fontSize: 12, fontWeight: 700 }}>✗</button>
                        </div>
                      ) : (
                        <span style={{
                          background: o.paymentStatus === 'approved' ? '#e8f5e9' : o.paymentStatus === 'rejected' ? '#ffebee' : '#fff3e0',
                          color: o.paymentStatus === 'approved' ? '#27ae60' : o.paymentStatus === 'rejected' ? '#e74c3c' : '#ef6c00',
                          padding: '3px 8px', borderRadius: 10, fontSize: 12, fontWeight: 600
                        }}>
                          {o.paymentStatus === 'approved' ? '✓ مدفوع' : o.paymentStatus === 'rejected' ? '✗ مرفوض' : '⏳ انتظار'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <select
                        value={o.status}
                        onChange={e => changeStatus(o._id, e.target.value)}
                        style={{ padding: '5px 8px', borderRadius: 8, fontSize: 12, fontWeight: 600, border: `2px solid ${SC[o.status]?.c || '#ddd'}`, background: SC[o.status]?.bg || '#f5f5f5', color: SC[o.status]?.c || '#333', cursor: 'pointer' }}
                      >
                        {ST.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#888', fontSize: 12 }}>
                      {new Date(o.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <button onClick={() => setSel(o)} style={{ padding: '5px 12px', background: '#e3f2fd', color: '#1565c0', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                        عرض
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: 16 }}>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => load(p)} style={{ padding: '6px 12px', borderRadius: 6, background: p === pagination.page ? '#1a3a5c' : '#fff', color: p === pagination.page ? '#fff' : '#333', border: '1px solid #ddd', cursor: 'pointer' }}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      {sel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={e => e.target === e.currentTarget && setSel(null)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 620, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: '#1a3a5c' }}>تفاصيل الطلب #{sel._id.slice(-8).toUpperCase()}</h3>
              <button onClick={() => setSel(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>✕</button>
            </div>

            {/* Customer */}
            <div style={ds}>
              <h4 style={dt}>👤 بيانات العميل</h4>
              <p style={dp}><strong>الاسم:</strong> {sel.customer?.name}</p>
              <p style={dp}><strong>البريد:</strong> {sel.customer?.email}</p>
              <p style={dp}><strong>الهاتف:</strong> {sel.customer?.phone}</p>
              <p style={{ ...dp, margin: 0 }}><strong>النوع:</strong> {sel.isGuestOrder ? '🙋 زائر (بدون حساب)' : '👤 مسجل'}</p>
            </div>

            {/* Shipping */}
            <div style={ds}>
              <h4 style={dt}>🚚 عنوان الشحن</h4>
              <p style={dp}>{sel.shippingAddress?.governorate?.ar} — {sel.shippingAddress?.city} — {sel.shippingAddress?.street}</p>
              {sel.shippingAddress?.building && <p style={dp}>مبنى: {sel.shippingAddress.building}</p>}
              <p style={{ ...dp, margin: 0 }}><strong>التوصيل المتوقع:</strong> {sel.estimatedDeliveryDays?.min}–{sel.estimatedDeliveryDays?.max} أيام</p>
            </div>

            {/* Items */}
            <div style={ds}>
              <h4 style={dt}>📦 المنتجات</h4>
              {sel.items?.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 }}>
                  <span>{item.name?.ar} × {item.quantity}</span>
                  <span style={{ fontWeight: 600 }}>{(item.unitPrice * item.quantity).toFixed(0)} ج.م</span>
                </div>
              ))}
              <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '10px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><span>رسوم الشحن</span><span>{sel.shippingFee} ج.م</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 16, marginTop: 6, color: '#1a3a5c' }}>
                <span>الإجمالي</span><span>{sel.total} ج.م</span>
              </div>
            </div>

            {/* InstaPay details + screenshot */}
            {sel.paymentMethod === 'instapay' && (
              <div style={ds}>
                <h4 style={dt}>📱 تفاصيل InstaPay</h4>
                <p style={dp}><strong>كود العملية:</strong> <span style={{ fontFamily: 'monospace', background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>{sel.instapayTransactionId}</span></p>
                <p style={{ ...dp, marginBottom: sel.instapayScreenshotUrl ? 12 : 0 }}><strong>حالة الدفع:</strong>
                  <span style={{ marginRight: 6, fontWeight: 600, color: sel.paymentStatus === 'approved' ? '#27ae60' : sel.paymentStatus === 'rejected' ? '#e74c3c' : '#ef6c00' }}>
                    {sel.paymentStatus === 'approved' ? '✓ موافق عليه' : sel.paymentStatus === 'rejected' ? '✗ مرفوض' : '⏳ بانتظار المراجعة'}
                  </span>
                </p>

                {/* Screenshot */}
                {sel.instapayScreenshotUrl ? (
                  <div>
                    <p style={{ margin: '0 0 8px', fontWeight: 600, fontSize: 13, color: '#555' }}>صورة التحويل:</p>
                    <a href={sel.instapayScreenshotUrl} target="_blank" rel="noopener noreferrer">
                      <img
                        src={sel.instapayScreenshotUrl}
                        alt="InstaPay screenshot"
                        style={{ width: '100%', maxHeight: 300, objectFit: 'contain', borderRadius: 10, border: '1px solid #ddd', cursor: 'zoom-in' }}
                      />
                      <p style={{ fontSize: 12, color: '#1565c0', textAlign: 'center', marginTop: 4 }}>انقر لعرض بالحجم الكامل</p>
                    </a>
                  </div>
                ) : (
                  <p style={{ color: '#e74c3c', fontSize: 13, margin: 0 }}>⚠ لم يرفع العميل صورة التحويل</p>
                )}

                {/* Approve/Reject buttons in modal */}
                {sel.paymentStatus === 'pending' && (
                  <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                    <button onClick={() => changePay(sel._id, 'approved')} style={{ flex: 1, padding: '10px', background: '#27ae60', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>✓ موافقة على التحويل</button>
                    <button onClick={() => changePay(sel._id, 'rejected')} style={{ flex: 1, padding: '10px', background: '#e74c3c', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>✗ رفض التحويل</button>
                  </div>
                )}
              </div>
            )}

            {/* Return info */}
            {sel.returnRequestedAt && (
              <div style={{ ...ds, background: '#fff3e0', border: '1px solid #ffcc80' }}>
                <h4 style={{ ...dt, color: '#ef6c00' }}>🔄 طلب الإرجاع</h4>
                <p style={dp}><strong>تاريخ الطلب:</strong> {new Date(sel.returnRequestedAt).toLocaleDateString('ar-EG')}</p>
                <p style={{ ...dp, margin: 0 }}><strong>السبب:</strong> {sel.returnReason}</p>
              </div>
            )}

            {/* Status history */}
            {sel.statusHistory?.length > 0 && (
              <div style={ds}>
                <h4 style={dt}>📋 سجل الحالة</h4>
                {sel.statusHistory.slice().reverse().map((h, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: SC[h.status]?.c || '#333' }}>{h.status}</span>
                    <span style={{ color: '#aaa' }}>{new Date(h.changedAt).toLocaleString('ar-EG')}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Change status in modal */}
            <div style={{ marginTop: 16 }}>
              <label style={{ display: 'block', marginBottom: 8, fontWeight: 600, color: '#555' }}>تغيير حالة الطلب:</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {ST.map(s => (
                  <button
                    key={s}
                    onClick={() => changeStatus(sel._id, s)}
                    style={{ padding: '7px 14px', background: sel.status === s ? SC[s]?.bg : '#f5f5f5', color: sel.status === s ? SC[s]?.c : '#555', border: `2px solid ${sel.status === s ? SC[s]?.c : '#ddd'}`, borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: sel.status === s ? 700 : 400 }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

const sel2 = { padding: '9px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fff', cursor: 'pointer' };
const ds = { background: '#fafafa', borderRadius: 10, padding: '14px 16px', marginBottom: 14 };
const dt = { margin: '0 0 10px', color: '#1a3a5c', fontSize: 15, fontWeight: 700 };
const dp = { margin: '0 0 6px', fontSize: 14, color: '#444' };
