import { useState, useEffect } from 'react';
import { useLang } from '../context/LangContext';
import { getReviews, submitReview } from '../api';
import toast from 'react-hot-toast';

export default function ReviewSection({ productId }) {
  const { t, lang } = useLang();
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
    try {
      await submitReview(productId, form);
      toast.success(lang === 'ar' ? 'تم إرسال تقييمك وسيظهر بعد المراجعة' : 'Review submitted, pending approval');
      setForm({ rating: 5, comment: '', guestName: '' });
    } catch {
      toast.error(lang === 'ar' ? 'حدث خطأ' : 'An error occurred');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ marginTop: 48 }}>
      <h2 style={{ color: '#6D1A36', borderRight: '4px solid #f8ad9d', paddingRight: 12, marginBottom: 20 }}>
        {t('reviews')} {reviews.length > 0 && <span style={{ fontSize: 16, color: '#888', fontWeight: 400 }}>({reviews.length})</span>}
      </h2>

      {reviews.length === 0 && !loading && (
        <p style={{ color: '#aaa', fontSize: 15, marginBottom: 24 }}>{t('noReviews')}</p>
      )}

      {reviews.map(r => (
        <div key={r._id} style={{ background: '#fff', borderRadius: 10, padding: '14px 18px', marginBottom: 12, border: '1px solid #f0e8e8', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
            <strong style={{ color: '#6D1A36' }}>{r.user?.name || r.guestName || (lang === 'ar' ? 'زائر' : 'Guest')}</strong>
            <div>
              <span style={{ color: '#f39c12' }}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              <span style={{ color: '#aaa', fontSize: 12, marginInlineStart: 8 }}>{new Date(r.createdAt).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-GB')}</span>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#444', lineHeight: 1.6 }}>{r.comment}</p>
        </div>
      ))}

      {hasMore && (
        <button
          onClick={() => load(page + 1, true)}
          disabled={loading}
          style={{ display: 'block', margin: '12px auto 24px', padding: '9px 28px', background: 'transparent', border: '2px solid #6D1A36', color: '#6D1A36', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
        >
          {loading ? '...' : t('loadMoreReviews')}
        </button>
      )}

      {/* Write review form */}
      <div style={{ background: '#faf5f5', borderRadius: 12, padding: 24, marginTop: 24, border: '1px solid #f0e8e8' }}>
        <h3 style={{ color: '#6D1A36', margin: '0 0 18px', fontSize: 17 }}>{t('writeReview')}</h3>
        <form onSubmit={submit}>
          <div style={{ marginBottom: 14 }}>
            <label style={ls}>{lang === 'ar' ? 'اسمك (اختياري)' : 'Your Name (optional)'}</label>
            <input value={form.guestName} onChange={e => setForm({ ...form, guestName: e.target.value })} style={is} placeholder={lang === 'ar' ? 'اسمك' : 'Your name'} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={ls}>{lang === 'ar' ? 'التقييم' : 'Rating'}</label>
            <select value={form.rating} onChange={e => setForm({ ...form, rating: Number(e.target.value) })} style={is}>
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 18 }}>
            <label style={ls}>{lang === 'ar' ? 'تعليقك' : 'Your Comment'}</label>
            <textarea
              required
              value={form.comment}
              onChange={e => setForm({ ...form, comment: e.target.value })}
              rows={3}
              maxLength={500}
              placeholder={lang === 'ar' ? 'شارك تجربتك مع المنتج...' : 'Share your experience with this product...'}
              style={{ ...is, resize: 'vertical' }}
            />
          </div>
          <button type="submit" disabled={submitting} style={{ background: '#6D1A36', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 28px', fontWeight: 600, cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 14 }}>
            {submitting ? '...' : t('submitReview')}
          </button>
        </form>
      </div>
    </div>
  );
}
const ls = { display: 'block', marginBottom: 6, fontWeight: 600, color: '#555', fontSize: 14 };
const is = { width: '100%', padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fff', boxSizing: 'border-box' };
