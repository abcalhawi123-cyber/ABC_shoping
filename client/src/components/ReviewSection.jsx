import { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import { getReviews, submitReview } from '../api';
import toast from 'react-hot-toast';

export default function ReviewSection({ productId }) {
  const { t } = useLang();
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ rating: 5, comment: '', guestName: '' });
  const [submitting, setSubmitting] = useState(false);

  const load = async (p = 1, append = false) => {
    setLoading(true);
    try {
      const { data } = await getReviews(productId, p);
      setReviews(prev => append ? [...prev, ...data.data] : data.data);
      setHasMore(data.pagination.hasMore);
      setPage(p);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(1); }, [productId]);

  const submit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try { await submitReview(productId, form); toast.success('تم إرسال تقييمك'); setForm({ rating: 5, comment: '', guestName: '' }); }
    catch { toast.error('حدث خطأ'); }
    setSubmitting(false);
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h2 style={{ color: '#1a3a5c', borderRight: '4px solid #f8ad9d', paddingRight: 12 }}>{t('reviews')}</h2>
      {reviews.length === 0 && !loading && <p style={{ color: '#aaa' }}>{t('noReviews')}</p>}
      {reviews.map(r => (
        <div key={r._id} style={{ background: '#fff', borderRadius: 10, padding: '14px 18px', marginBottom: 12, border: '1px solid #f0e8e8' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <strong style={{ color: '#1a3a5c' }}>{r.user?.name || r.guestName || 'زائر'}</strong>
            <span style={{ color: '#f39c12' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#444' }}>{r.comment}</p>
        </div>
      ))}
      {hasMore && <button onClick={() => load(page + 1, true)} disabled={loading} style={{ display: 'block', margin: '12px auto 24px', padding: '9px 24px', background: 'transparent', border: '2px solid #1a3a5c', color: '#1a3a5c', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>{loading ? '...' : t('loadMoreReviews')}</button>}
      <div style={{ background: '#faf5f5', borderRadius: 12, padding: 20, marginTop: 24 }}>
        <h3 style={{ color: '#1a3a5c', margin: '0 0 16px' }}>{t('writeReview')}</h3>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 12 }}><label style={ls}>اسمك</label><input value={form.guestName} onChange={e => setForm({ ...form, guestName: e.target.value })} style={is} /></div>
          <div style={{ marginBottom: 12 }}><label style={ls}>التقييم</label><select value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} style={is}>{[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}</select></div>
          <div style={{ marginBottom: 16 }}><label style={ls}>تعليقك</label><textarea required value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} rows={3} style={{ ...is, resize: 'vertical' }} /></div>
          <button type="submit" disabled={submitting} style={{ background: '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 24px', fontWeight: 600, cursor: 'pointer' }}>{submitting ? '...' : t('submitReview')}</button>
        </form>
      </div>
    </div>
  );
}
const ls = { display: 'block', marginBottom: 6, fontWeight: 600, color: '#555', fontSize: 14 };
const is = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fff', boxSizing: 'border-box' };
