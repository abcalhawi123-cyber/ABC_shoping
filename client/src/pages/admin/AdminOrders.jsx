import { useState, useEffect } from 'react';
import { getAdminOrders, updateOrderStatus, updateOrderPayment } from '../../api';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import { useLang } from '../../context/LangContext';

const BG = '#6D1A36';
const ST = ['قيد المراجعة','جاري التجهيز','تم الشحن','تم التسليم','مرتجع'];
const SC = {
  'قيد المراجعة':{bg:'#fff3e0',c:'#ef6c00'},
  'جاري التجهيز':{bg:'#e3f2fd',c:'#1565c0'},
  'تم الشحن':{bg:'#e8eaf6',c:'#3949ab'},
  'تم التسليم':{bg:'#e8f5e9',c:'#2e7d32'},
  'مرتجع':{bg:'#ffebee',c:'#c62828'},
};

export default function AdminOrders() {
  const { t, lang } = useLang();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page:1, pages:1, total:0 });
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState(null);
  const [searchInput, setSearchInput] = useState('');   // what user types
  const [activeSearch, setActiveSearch] = useState('');  // what is actually applied
  const [filters, setFilters] = useState({ status:'', paymentMethod:'', paymentStatus:'' });

  // FIXED: load() now correctly sends the search term to backend
  const load = (page = 1, searchTerm = activeSearch) => {
    setLoading(true);
    const params = { page, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) };
    if (searchTerm && searchTerm.trim()) {
      params.search = searchTerm.trim();
    }
    getAdminOrders(params)
      .then(r => { setOrders(r.data.data); setPagination(r.data.pagination); })
      .catch(() => toast.error('فشل التحميل'))
      .finally(() => setLoading(false));
  };

  // Reload when filters change (keep current search active)
  useEffect(() => { load(1, activeSearch); }, [filters]);

  // FIXED: handleSearch now properly triggers a new filtered fetch
  const handleSearch = e => {
    e.preventDefault();
    setActiveSearch(searchInput);
    load(1, searchInput);
  };

  const clearSearch = () => {
    setSearchInput('');
    setActiveSearch('');
    load(1, '');
  };

  const changeStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, { status });
      toast.success(`✓ ${status}`);
      load(pagination.page, activeSearch);
      if (sel?._id === id) setSel(p => ({ ...p, status }));
    } catch (err) { toast.error(err.response?.data?.message || 'خطأ'); }
  };

  const changePay = async (id, paymentStatus) => {
    try {
      await updateOrderPayment(id, { paymentStatus });
      toast.success(paymentStatus === 'approved' ? '✓ موافق' : '✗ مرفوض');
      load(pagination.page, activeSearch);
      if (sel?._id === id) setSel(p => ({ ...p, paymentStatus }));
    } catch { toast.error('خطأ'); }
  };

  return (
    <AdminLayout>
      <h2 style={{ color:BG, marginBottom:20 }}>
        🛒 {lang==='ar'?'إدارة الطلبات':'Order Management'}
        <span style={{ fontSize:14, fontWeight:400, color:'#888', marginInlineStart:8 }}>({pagination.total||0})</span>
      </h2>

      {/* Search + Filters */}
      <div style={{ background:'#fff', borderRadius:12, padding:'16px 20px', marginBottom:20, boxShadow:'0 1px 6px rgba(0,0,0,0.06)' }}>
        <form onSubmit={handleSearch} style={{ display:'flex', gap:10, marginBottom:14, flexWrap:'wrap' }}>
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder={lang==='ar'?'ابحث باسم العميل أو رقم الهاتف أو البريد...':'Search by name, phone, or email...'}
            style={{ flex:1, minWidth:200, padding:'10px 14px', border:'1px solid #ddd', borderRadius:8, fontSize:14, background:'#fafafa' }}
          />
          <button type="submit" style={{ padding:'10px 20px', background:BG, color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600, fontSize:14 }}>
            🔍 {lang==='ar'?'بحث':'Search'}
          </button>
          {activeSearch && (
            <button type="button" onClick={clearSearch} style={{ padding:'10px 14px', background:'#f5f5f5', color:'#555', border:'1px solid #ddd', borderRadius:8, cursor:'pointer', fontSize:14 }}>
              ✕ {lang==='ar'?'مسح':'Clear'}
            </button>
          )}
        </form>

        {activeSearch && (
          <p style={{ fontSize:13, color:BG, marginBottom:12, fontWeight:600 }}>
            {lang==='ar'?'نتائج البحث عن:':'Search results for:'} "{activeSearch}"
          </p>
        )}

        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <select value={filters.status} onChange={e => setFilters({...filters, status:e.target.value})} style={sel2}>
            <option value="">{lang==='ar'?'كل الحالات':'All Statuses'}</option>
            {ST.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.paymentMethod} onChange={e => setFilters({...filters, paymentMethod:e.target.value})} style={sel2}>
            <option value="">{lang==='ar'?'كل طرق الدفع':'All Payment Methods'}</option>
            <option value="cod">{lang==='ar'?'كاش':'COD'}</option>
            <option value="instapay">InstaPay</option>
            <option value="card">{lang==='ar'?'بطاقة':'Card'}</option>
          </select>
          <select value={filters.paymentStatus} onChange={e => setFilters({...filters, paymentStatus:e.target.value})} style={sel2}>
            <option value="">{lang==='ar'?'كل حالات الدفع':'All Payment Status'}</option>
            <option value="pending">{lang==='ar'?'انتظار':'Pending'}</option>
            <option value="approved">{lang==='ar'?'مدفوع':'Approved'}</option>
            <option value="rejected">{lang==='ar'?'مرفوض':'Rejected'}</option>
          </select>
          <button onClick={() => { setFilters({status:'',paymentMethod:'',paymentStatus:''}); clearSearch(); }}
            style={{ padding:'9px 14px', background:'#fff5f5', color:'#c0392b', border:'1px solid #f5c6c6', borderRadius:8, cursor:'pointer', fontSize:13, fontWeight:600 }}>
            {lang==='ar'?'إعادة تعيين':'Reset All'}
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#888' }}>{t('loading')}</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'#aaa' }}>
          <p style={{ fontSize:48 }}>📭</p>
          <p>{lang==='ar'?'لا توجد طلبات مطابقة':'No matching orders'}</p>
        </div>
      ) : (
        <div style={{ background:'#fff', borderRadius:12, boxShadow:'0 2px 12px rgba(0,0,0,0.06)', overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:14 }}>
              <thead>
                <tr style={{ background:'#fdf5f7' }}>
                  {['#','العميل','الإجمالي','الدفع','حالة الدفع','حالة الطلب','التاريخ','تفاصيل'].map(h => (
                    <th key={h} style={{ padding:'12px 14px', textAlign:'right', fontWeight:600, borderBottom:`2px solid ${BG}20`, whiteSpace:'nowrap', color:BG }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map((o, idx) => (
                  <tr key={o._id} style={{ borderBottom:'1px solid #f5f5f5', background: o.paymentMethod==='instapay'&&o.paymentStatus==='pending'?'#fffbf0':'#fff' }}>
                    <td style={{ padding:'10px 14px', color:'#aaa', fontSize:12 }}>{idx+1}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <p style={{ margin:0, fontWeight:600 }}>{o.customer?.name}</p>
                      <p style={{ margin:0, fontSize:12, color:'#888' }}>{o.customer?.phone}</p>
                    </td>
                    <td style={{ padding:'10px 14px', fontWeight:700, color:BG }}>{o.total} ج.م</td>
                    <td style={{ padding:'10px 14px' }}>
                      <span style={{ background:'#f0e6ea', color:BG, padding:'3px 8px', borderRadius:10, fontSize:12, fontWeight:600 }}>
                        {o.paymentMethod==='cod'?'💵 كاش':o.paymentMethod==='instapay'?'📱 InstaPay':'💳 بطاقة'}
                      </span>
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      {o.paymentMethod==='instapay'&&o.paymentStatus==='pending' ? (
                        <div style={{ display:'flex', gap:4 }}>
                          <button onClick={() => changePay(o._id,'approved')} style={{ padding:'4px 8px', background:'#27ae60', color:'#fff', border:'none', borderRadius:5, cursor:'pointer', fontSize:12, fontWeight:700 }}>✓</button>
                          <button onClick={() => changePay(o._id,'rejected')} style={{ padding:'4px 8px', background:'#c0392b', color:'#fff', border:'none', borderRadius:5, cursor:'pointer', fontSize:12, fontWeight:700 }}>✗</button>
                        </div>
                      ) : (
                        <span style={{ background:o.paymentStatus==='approved'?'#e8f5e9':o.paymentStatus==='rejected'?'#ffebee':'#fff3e0', color:o.paymentStatus==='approved'?'#27ae60':o.paymentStatus==='rejected'?'#c0392b':'#ef6c00', padding:'3px 8px', borderRadius:10, fontSize:12, fontWeight:600 }}>
                          {o.paymentStatus==='approved'?'✓ مدفوع':o.paymentStatus==='rejected'?'✗ مرفوض':'⏳ انتظار'}
                        </span>
                      )}
                    </td>
                    <td style={{ padding:'10px 14px' }}>
                      <select value={o.status} onChange={e => changeStatus(o._id, e.target.value)}
                        style={{ padding:'5px 8px', borderRadius:8, fontSize:12, fontWeight:600, border:`2px solid ${SC[o.status]?.c||'#ddd'}`, background:SC[o.status]?.bg||'#f5f5f5', color:SC[o.status]?.c||'#333', cursor:'pointer' }}>
                        {ST.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td style={{ padding:'10px 14px', color:'#888', fontSize:12 }}>{new Date(o.createdAt).toLocaleDateString('ar-EG')}</td>
                    <td style={{ padding:'10px 14px' }}>
                      <button onClick={() => setSel(o)} style={{ padding:'5px 12px', background:'#e3f2fd', color:'#1565c0', border:'none', borderRadius:6, cursor:'pointer', fontSize:13, fontWeight:600 }}>عرض</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pagination.pages > 1 && (
            <div style={{ display:'flex', gap:8, justifyContent:'center', padding:16 }}>
              {Array.from({length:pagination.pages},(_,i)=>i+1).map(p => (
                <button key={p} onClick={() => load(p, activeSearch)} style={{ padding:'6px 12px', borderRadius:6, background:p===pagination.page?BG:'#fff', color:p===pagination.page?'#fff':'#333', border:'1px solid #ddd', cursor:'pointer' }}>{p}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail Modal */}
      {sel && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={e => e.target===e.currentTarget&&setSel(null)}>
          <div style={{ background:'#fff', borderRadius:16, padding:28, width:'100%', maxWidth:620, maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:20 }}>
              <h3 style={{ margin:0, color:BG }}>{lang==='ar'?'تفاصيل الطلب':'Order Details'} #{sel._id.slice(-8).toUpperCase()}</h3>
              <button onClick={() => setSel(null)} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'#888' }}>✕</button>
            </div>
            <div style={ds}>
              <h4 style={dt}>👤 {lang==='ar'?'بيانات العميل':'Customer Info'}</h4>
              <p style={dp}><strong>{lang==='ar'?'الاسم:':'Name:'}</strong> {sel.customer?.name}</p>
              <p style={dp}><strong>{lang==='ar'?'البريد:':'Email:'}</strong> {sel.customer?.email}</p>
              <p style={{...dp,margin:0}}><strong>{lang==='ar'?'الهاتف:':'Phone:'}</strong> {sel.customer?.phone}</p>
            </div>
            <div style={ds}>
              <h4 style={dt}>🚚 {lang==='ar'?'عنوان الشحن':'Shipping Address'}</h4>
              <p style={{...dp,margin:0}}>{sel.shippingAddress?.governorate?.ar} — {sel.shippingAddress?.city} — {sel.shippingAddress?.street}</p>
            </div>
            <div style={ds}>
              <h4 style={dt}>📦 {lang==='ar'?'المنتجات':'Items'}</h4>
              {sel.items?.map((item,i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:14 }}>
                  <span>{item.name?.ar} × {item.quantity}</span>
                  <span style={{ fontWeight:600 }}>{(item.unitPrice*item.quantity).toFixed(0)} ج.م</span>
                </div>
              ))}
              <hr style={{ border:'none', borderTop:'1px solid #eee', margin:'10px 0' }} />
              <div style={{ display:'flex', justifyContent:'space-between', fontWeight:700, fontSize:16, color:BG }}>
                <span>{lang==='ar'?'الإجمالي':'Total'}</span><span>{sel.total} ج.م</span>
              </div>
            </div>
            {sel.paymentMethod==='instapay' && (
              <div style={ds}>
                <h4 style={dt}>📱 InstaPay</h4>
                <p style={dp}><strong>{lang==='ar'?'كود العملية:':'Transaction ID:'}</strong> {sel.instapayTransactionId}</p>
                {sel.instapayScreenshotUrl && (
                  <a href={sel.instapayScreenshotUrl} target="_blank" rel="noopener noreferrer">
                    <img src={sel.instapayScreenshotUrl} alt="" style={{ width:'100%', maxHeight:300, objectFit:'contain', borderRadius:10, border:'1px solid #ddd', marginTop:8 }} />
                  </a>
                )}
                {sel.paymentStatus==='pending' && (
                  <div style={{ display:'flex', gap:10, marginTop:12 }}>
                    <button onClick={() => changePay(sel._id,'approved')} style={{ flex:1, padding:10, background:'#27ae60', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>✓ {t('approve')}</button>
                    <button onClick={() => changePay(sel._id,'rejected')} style={{ flex:1, padding:10, background:'#c0392b', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>✗ {t('reject')}</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
const sel2 = { padding:'9px 14px', border:'1px solid #ddd', borderRadius:8, fontSize:14, background:'#fff', cursor:'pointer' };
const ds = { background:'#fafafa', borderRadius:10, padding:'14px 16px', marginBottom:14 };
const dt = { margin:'0 0 10px', color:BG, fontSize:15, fontWeight:700 };
const dp = { margin:'0 0 6px', fontSize:14, color:'#444' };
