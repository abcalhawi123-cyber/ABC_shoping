import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLang } from '../context/LangContext';
import { useCart } from '../context/CartContext';
import { getProduct } from '../api';
import ReviewSection from '../components/ReviewSection';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const { t, lang } = useLang();
  const { dispatch } = useCart();
  const [product, setProduct] = useState(null);
  const [img, setImg] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProduct(slug).then(r => setProduct(r.data.data)).catch(() => setProduct(null)).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 0' }}>جاري التحميل...</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '80px 0' }}>المنتج غير موجود</div>;

  const name = product.name?.[lang] || product.name?.ar || '';
  const desc = product.description?.[lang] || product.description?.ar || '';
  const cat = product.category?.[lang] || product.category?.ar || '';
  const price = product.sellingPrice * (1 - (product.discount || 0) / 100);

  return (
    <>
      <Helmet>
        <title>{name} — ABC الحاوي</title>
        <meta name="description" content={desc.substring(0, 160)} />
        <meta property="og:title" content={name} />
        <meta property="og:image" content={product.images?.[0]?.url} />
      </Helmet>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 40 }}>
        <div>
          <div style={{ borderRadius: 14, overflow: 'hidden', aspectRatio: '1', background: '#faf5f5', marginBottom: 12 }}>
            <img src={product.images?.[img]?.url || ''} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {product.images.map((im, i) => <img key={i} src={im.url} alt="" onClick={() => setImg(i)} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: i === img ? '2px solid #f8ad9d' : '2px solid transparent' }} />)}
            </div>
          )}
        </div>
        <div>
          <p style={{ color: '#f8ad9d', fontWeight: 600, margin: '0 0 6px' }}>{cat}</p>
          <h1 style={{ color: '#1a3a5c', margin: '0 0 12px', fontSize: 26 }}>{name}</h1>
          {product.averageRating > 0 && <div style={{ color: '#f39c12', fontSize: 18, marginBottom: 12 }}>{'★'.repeat(Math.round(product.averageRating))}{'☆'.repeat(5 - Math.round(product.averageRating))} <span style={{ color: '#888', fontSize: 14 }}>({product.reviewCount} {t('reviews')})</span></div>}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#1a3a5c' }}>{price.toFixed(0)} ج.م</span>
            {product.discount > 0 && <span style={{ textDecoration: 'line-through', color: '#aaa', fontSize: 18 }}>{product.sellingPrice} ج.م</span>}
          </div>
          <p style={{ color: '#555', lineHeight: 1.7, marginBottom: 24 }}>{desc}</p>
          <p style={{ marginBottom: 20, fontWeight: 600, color: product.stock === 0 ? '#e74c3c' : product.stock < 5 ? '#e74c3c' : '#27ae60' }}>
            {product.stock === 0 ? '✗ غير متوفر' : product.stock < 5 ? `⚠ ${product.stock} قطع فقط!` : `✓ متوفر`}
          </p>
          <button onClick={() => { dispatch({ type: 'ADD', item: product }); toast.success('تمت الإضافة ✓'); }} disabled={product.stock < 1}
            style={{ width: '100%', padding: 14, background: product.stock < 1 ? '#ccc' : '#1a3a5c', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: product.stock < 1 ? 'not-allowed' : 'pointer', marginBottom: 10 }}>
            {product.stock < 1 ? t('outOfStock') : t('addToCart')}
          </button>
          <p style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>{t('returnPolicy')}</p>
        </div>
      </div>
      <ReviewSection productId={product._id} />
    </>
  );
}
