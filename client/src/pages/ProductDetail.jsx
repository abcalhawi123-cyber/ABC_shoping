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

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 20px', color: '#888' }}>{lang === 'ar' ? 'جاري التحميل...' : 'Loading...'}</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '80px 20px', color: '#e74c3c' }}>{lang === 'ar' ? 'المنتج غير موجود' : 'Product not found'}</div>;

  const name = product.name?.[lang] || product.name?.ar || '';
  const desc = product.description?.[lang] || product.description?.ar || '';
  const cat = product.category?.[lang] || product.category?.ar || '';
  const price = product.sellingPrice * (1 - (product.discount || 0) / 100);

  const stockInfo = product.stock === 0
    ? { text: `✗ ${t('outOfStock')}`, color: '#e74c3c' }
    : product.stock < 5
    ? { text: `⚠ ${product.stock} ${t('onlyLeft')}`, color: '#e74c3c' }
    : { text: lang === 'ar' ? `✓ متوفر (${product.stock} قطعة)` : `✓ In Stock (${product.stock})`, color: '#27ae60' };

  return (
    <>
      <Helmet>
        <title>{name} — ABC {lang === 'ar' ? 'الحاوي' : 'Al-Hawi'}</title>
        <meta name="description" content={product.metaDescription || desc.substring(0, 160)} />
        <meta property="og:title" content={name} />
        <meta property="og:image" content={product.images?.[0]?.url} />
        <meta property="og:type" content="product" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Product', name,
          image: product.images?.map(i => i.url), description: desc,
          offers: { '@type': 'Offer', price: price.toFixed(2), priceCurrency: 'EGP', availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' },
          aggregateRating: product.reviewCount > 0 ? { '@type': 'AggregateRating', ratingValue: product.averageRating, reviewCount: product.reviewCount } : undefined,
        })}</script>
      </Helmet>

      {/* Responsive 2-col → 1-col on mobile */}
      <div className="grid-2col" style={{ marginBottom: 40 }}>
        {/* Images */}
        <div>
          <div style={{ borderRadius: 14, overflow: 'hidden', aspectRatio: '1', background: '#faf5f5', marginBottom: 12 }}>
            <img src={product.images?.[img]?.url || ''} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {product.images.map((im, i) => (
                <img key={i} src={im.url} alt="" onClick={() => setImg(i)}
                  style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: i === img ? '2px solid #f8ad9d' : '2px solid #eee' }} />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p style={{ color: '#f8ad9d', fontWeight: 600, margin: '0 0 6px', fontSize: 13 }}>{cat}</p>
          <h1 style={{ color: '#1a3a5c', margin: '0 0 12px', fontSize: 24, lineHeight: 1.3 }}>{name}</h1>

          {product.averageRating > 0 && (
            <div style={{ color: '#f39c12', fontSize: 17, marginBottom: 12 }}>
              {'★'.repeat(Math.round(product.averageRating))}{'☆'.repeat(5 - Math.round(product.averageRating))}
              <span style={{ color: '#888', fontSize: 13, marginInlineStart: 6 }}>({product.reviewCount} {t('reviews')})</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#1a3a5c' }}>{price.toFixed(0)} ج.م</span>
            {product.discount > 0 && (
              <>
                <span style={{ textDecoration: 'line-through', color: '#aaa', fontSize: 17 }}>{product.sellingPrice} ج.م</span>
                <span style={{ background: '#ffeaa7', color: '#d35400', padding: '3px 10px', borderRadius: 12, fontSize: 13, fontWeight: 700 }}>
                  {lang === 'ar' ? `وفر ${product.discount}%` : `Save ${product.discount}%`}
                </span>
              </>
            )}
          </div>

          <p style={{ color: '#555', lineHeight: 1.8, marginBottom: 16, fontSize: 15 }}>{desc}</p>
          <p style={{ marginBottom: 18, fontWeight: 600, color: stockInfo.color, fontSize: 14 }}>{stockInfo.text}</p>

          <button
            onClick={() => { if (!product.stock) return; dispatch({ type: 'ADD', item: product }); toast.success(lang === 'ar' ? 'تمت الإضافة ✓' : 'Added ✓'); }}
            disabled={product.stock < 1}
            style={{ width: '100%', padding: '14px', background: product.stock < 1 ? '#ccc' : '#1a3a5c', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: product.stock < 1 ? 'not-allowed' : 'pointer', marginBottom: 10 }}
          >
            {product.stock < 1 ? t('outOfStock') : t('addToCart')}
          </button>
          <p style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>{t('returnPolicy')}</p>
        </div>
      </div>

      <ReviewSection productId={product._id} />
    </>
  );
}
