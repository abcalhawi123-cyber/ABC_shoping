import { useState, useEffect } from 'react';
import { getAdminReturns, updateReturn } from '../../api';
import toast from 'react-hot-toast';
import AdminLayout from './AdminLayout';
import { useLang } from '../../context/LangContext';

const BG = '#6D1A36';

const STATUS_COLORS = {
  pending:  { bg: '#fff3e0', c: '#ef6c00', label_ar: 'قيد المراجعة', label_en: 'Pending' },
  approved: { bg: '#e8f5e9', c: '#27ae60', label_ar: 'موافق',        label_en: 'Approved' },
  rejected: { bg: '#ffebee', c: '#c62828', label_ar: 'مرفوض',        label_en: 'Rejected' },
};

export default function AdminReturns() {
  const { t, lang } = useLang();
  const [returns, setReturns] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [busy, setBusy] = useState(false);

  const load = (page = 1) => {
    setLoading(true);
    const p = { page };
    if (filter) p.status = filter;
    getAdminReturns(p)
      .then(r => { setReturns(r.data.data); setPagination(r.data.pagination); })
      .catch(() => toast.error('فشل التحميل'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1); }, [filter]);

  const handleAction = async (id, status) => {
    setBusy(true);
    try {
      await updateReturn(id, { status, adminNote });
      toast.success(status === 'approved' ? (lang === 'ar' ? 'تمت الموافقة ✓' : 'Approved ✓') : (lang === 'ar' ? 'تم الرفض' : 'Rejected'));
      setSelected(null);
      setAdminNote('');
      load(pagination.page);
    } catch { toast.error('حدث خطأ'); }
    setBusy(false);
  };

  return (
    <AdminLayout>
      <h2 style={{ color: BG, marginBottom: 20 }}>🔄 {t('adminReturns')}
        <span style={{ fontSize: 14, fontWeight: 400, color: '#888', marginInlineStart: 8 }}>({pagination.total})</span>
      </h2>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { v: '', l: lang === 'ar' ? 'الكل' : 'All' },
          { v: 'pending',  l: lang === 'ar' ? 'قيد المراجعة' : 'Pending' },
          { v: 'approved', l: lang === 'ar' ? 'موافق' : 'Approved' },
          { v: 'rejected', l: lang === 'ar' ? 'مرفوض' : 'Rejected' },
        ].map(o => (
          <button key={o.v} onClick={() => setFilter(o.v)}
            style={{ padding: '8px 16px', background: filter === o.v ? BG : '#fff', color: filter === o.v ? '#fff' : '#555', border: `1px solid ${filter === o.v ? BG : '#ddd'}`, borderRadius: 8, cursor: 'pointer', fontWeight: filter === o.v ? 700 : 400, fontSize: 13 }}>
            {o.l}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>{t('loading')}</div>
      ) : returns.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: '48px', textAlign: 'center', color: '#aaa' }}>
          <p style={{ fontSize: 48 }}>📭</p>
          <p>{lang === 'ar' ? 'لا توجد طلبات إرجاع' : 'No return requests'}</p>
        </div>
      ) : (
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: '#fdf5f7' }}>
                  {[
                    lang === 'ar' ? 'اسم المنتج' : 'Product Name',
                    lang === 'ar' ? 'اسم المستخدم' : 'Username',
                    lang === 'ar' ? 'رقم الهاتف' : 'Phone Number',
                    lang === 'ar' ? 'تاريخ العملية' : 'Return Date',
                    lang === 'ar' ? 'سبب الإرجاع' : 'Reason',
                    lang === 'ar' ? 'الحالة' : 'Status',
                    lang === 'ar' ? 'إجراءات' : 'Actions',
                  ].map(h => (
                    <th key={h} style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600, borderBottom: `2px solid ${BG}20`, color: BG, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {returns.map(ret => {
                  const sc = STATUS_COLORS[ret.status] || STATUS_COLORS.pending;
                  return (
                    <tr key={ret._id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                      {/* Product Name */}
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {ret.productImage && (
                            <img src={ret.productImage} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                          )}
                          <div>
                            <p style={{ margin: 0, fontWeight: 600, color: '#1a1a1a' }}>
                              {ret.productName?.[lang] || ret.productName?.ar || (lang === 'ar' ? 'غير محدد' : 'N/A')}
                            </p>
                            <p style={{ margin: 0, fontSize: 11, color: '#aaa' }}>الكمية: {ret.quantity}</p>
                          </div>
                        </div>
                      </td>
                      {/* Username */}
                      <td style={{ padding: '12px 14px', fontWeight: 600, color: '#333' }}>
                        {ret.customerName}
                      </td>
                      {/* Phone */}
                      <td style={{ padding: '12px 14px', fontFamily: 'monospace', color: BG, fontWeight: 600 }}>
                        {ret.customerPhone}
                      </td>
                      {/* Date */}
                      <td style={{ padding: '12px 14px', color: '#555', fontSize: 13 }}>
                        {new Date(ret.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB')}
                        <br />
                        <span style={{ fontSize: 11, color: '#aaa' }}>{new Date(ret.createdAt).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-GB', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      {/* Reason */}
                      <td style={{ padding: '12px 14px', color: '#555', maxWidth: 200 }}>
                        <p style={{ margin: 0, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={ret.reason}>
                          {ret.reason}
                        </p>
                      </td>
                      {/* Status */}
                      <td style={{ padding: '12px 14px' }}>
                        <span style={{ background: sc.bg, color: sc.c, padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                          {lang === 'ar' ? sc.label_ar : sc.label_en}
                        </span>
                      </td>
                      {/* Actions */}
                      <td style={{ padding: '12px 14px' }}>
                        {ret.status === 'pending' ? (
                          <button onClick={() => { setSelected(ret); setAdminNote(''); }}
                            style={{ padding: '6px 12px', background: BG, color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                            {lang === 'ar' ? 'مراجعة' : 'Review'}
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: '#aaa' }}>
                            {ret.resolvedAt ? new Date(ret.resolvedAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB') : '—'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', padding: 16 }}>
              {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => load(p)} style={{ padding: '6px 12px', borderRadius: 6, background: p === pagination.page ? BG : '#fff', color: p === pagination.page ? '#fff' : '#333', border: '1px solid #ddd', cursor: 'pointer' }}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: BG }}>🔄 {lang === 'ar' ? 'مراجعة طلب الإرجاع' : 'Review Return Request'}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>✕</button>
            </div>

            {/* Return details */}
            <div style={{ background: '#fdf5f7', borderRadius: 10, padding: 16, marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
                {selected.productImage && <img src={selected.productImage} alt="" style={{ width: 52, height: 52, objectFit: 'cover', borderRadius: 8 }} />}
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: '#1a1a1a' }}>{selected.productName?.[lang] || selected.productName?.ar}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{lang === 'ar' ? 'الكمية:' : 'Qty:'} {selected.quantity}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
                <div>
                  <p style={{ margin: '0 0 2px', color: '#888', fontSize: 11 }}>{lang === 'ar' ? 'اسم المستخدم' : 'Username'}</p>
                  <p style={{ margin: 0, fontWeight: 600, color: '#333' }}>{selected.customerName}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 2px', color: '#888', fontSize: 11 }}>{lang === 'ar' ? 'رقم الهاتف' : 'Phone'}</p>
                  <p style={{ margin: 0, fontWeight: 600, color: BG, fontFamily: 'monospace' }}>{selected.customerPhone}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 2px', color: '#888', fontSize: 11 }}>{lang === 'ar' ? 'تاريخ الطلب' : 'Date'}</p>
                  <p style={{ margin: 0, fontWeight: 600, color: '#333' }}>{new Date(selected.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB')}</p>
                </div>
                <div>
                  <p style={{ margin: '0 0 2px', color: '#888', fontSize: 11 }}>{lang === 'ar' ? 'البريد الإلكتروني' : 'Email'}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#555' }}>{selected.customerEmail || '—'}</p>
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <p style={{ margin: '0 0 4px', color: '#888', fontSize: 11 }}>{lang === 'ar' ? 'سبب الإرجاع' : 'Return Reason'}</p>
                <p style={{ margin: 0, color: '#333', fontSize: 14, lineHeight: 1.5 }}>{selected.reason}</p>
              </div>
            </div>

            {/* Admin note */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 6, fontWeight: 600, color: '#555', fontSize: 14 }}>
                {lang === 'ar' ? 'ملاحظة للعميل (اختياري)' : 'Note to customer (optional)'}
              </label>
              <textarea value={adminNote} onChange={e => setAdminNote(e.target.value)} rows={2}
                placeholder={lang === 'ar' ? 'اكتب ملاحظة...' : 'Write a note...'}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }} />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => handleAction(selected._id, 'approved')} disabled={busy}
                style={{ flex: 1, padding: '12px', background: busy ? '#ccc' : '#27ae60', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer', fontSize: 14 }}>
                ✓ {t('approve')}
              </button>
              <button onClick={() => handleAction(selected._id, 'rejected')} disabled={busy}
                style={{ flex: 1, padding: '12px', background: busy ? '#ccc' : '#c0392b', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer', fontSize: 14 }}>
                ✗ {t('reject')}
              </button>
              <button onClick={() => setSelected(null)}
                style={{ padding: '12px 16px', background: '#f5f5f5', color: '#555', border: '1px solid #ddd', borderRadius: 8, cursor: 'pointer', fontSize: 14 }}>
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
