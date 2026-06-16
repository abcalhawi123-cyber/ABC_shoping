import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getReviews, submitReview } from '../api';
import toast from 'react-hot-toast';

export default function ReviewSection({ productId }) {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ rating: 5, comment: '', guestName: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchReviews = async (p = 1, append = false) => {
    setLoading(true);
    try {
      const { data } = await getReviews(productId, p);
      setReviews((prev) => append ? [...prev, ...data.data] : data.data);
      setHasMore(data.pagination.hasMore);
      setPage(p);
    } catch {
      // silent
    }
    setLoading(false);
  };

  useEffect(() => { fetchReviews(1); }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitReview(productId, form);
      toast.success('تم إرسال تقييمك وسيظهر بعد المراجعة');
      setForm({ rating: 5, comment: '', guestName: '' });
    } catch {
      toast.error('حدث خطأ، حاول مرة أخرى');
    }
    setSubmitting(false);
  };

  return (
    <div style={{ marginTop: 40 }}>
      <h2 style={{ color: '#1a3a5c', borderRight: '4px solid #f8ad9d', paddingRight: 12 }}>
        {t('reviews')}
      </h2>

      {/* Review list */}
      {reviews.length === 0 && !loading && (
        <p style={{ color: '#aaa' }}>{t('noReviews')}</p>
      )}

      {reviews.map((review) => (
        <div key={review._id} style={{
          background: '#fff',
          borderRadius: 10,
          padding: '14px 18px',
          marginBottom: 12,
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          border: '1px solid #f0e8e8',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <strong style={{ color: '#1a3a5c' }}>
              {review.user?.name || review.guestName || 'زائر'}
            </strong>
            <span style={{ color: '#f39c12' }}>
              {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: '#444' }}>{review.comment}</p>
          <small style={{ color: '#aaa', fontSize: 12 }}>
            {new Date(review.createdAt).toLocaleDateString('ar-EG')}
          </small>
        </div>
      ))}

      {hasMore && (
        <button
          onClick={() => fetchReviews(page + 1, true)}
          disabled={loading}
          style={{
            display: 'block', margin: '12px auto 24px',
            padding: '9px 24px',
            background: 'transparent',
            border: '2px solid #1a3a5c',
            color: '#1a3a5c',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          {loading ? '...' : t('loadMoreReviews')}
        </button>
      )}

      {/* Submit form */}
      <div style={{ background: '#faf5f5', borderRadius: 12, padding: '20px', marginTop: 24 }}>
        <h3 style={{ color: '#1a3a5c', margin: '0 0 16px' }}>{t('writeReview')}</h3>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>اسمك</label>
            <input
              value={form.guestName}
              onChange={(e) => setForm({ ...form, guestName: e.target.value })}
              placeholder="اسمك (اختياري)"
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>التقييم</label>
            <select
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
              style={inputStyle}
            >
              {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} ★</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={labelStyle}>تعليقك</label>
            <textarea
              required
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              rows={3}
              maxLength={500}
              placeholder="شارك تجربتك مع المنتج..."
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            style={{
              background: '#1a3a5c', color: '#fff',
              border: 'none', borderRadius: 8,
              padding: '10px 24px', fontWeight: 600,
              cursor: 'pointer', fontSize: 14,
            }}
          >
            {submitting ? '...' : t('submitReview')}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '10px 12px',
  border: '1px solid #ddd', borderRadius: 8,
  fontSize: 14, background: '#fff',
  boxSizing: 'border-box',
};
const labelStyle = { display: 'block', marginBottom: 6, fontWeight: 600, color: '#555', fontSize: 14 };
