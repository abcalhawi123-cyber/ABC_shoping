import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLang } from '../context/LangContext';
import { getProduct } from '../api';
import { useCart } from '../context/CartContext';
import ReviewSection from '../components/ReviewSection';
import toast from 'react-hot-toast';

export default function ProductDetail() {
  const { slug } = useParams();
  const { t, lang } = useLang();
  const { dispatch } = useCart();
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getProduct(slug)
      .then(r => setProduct(r.data.data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 0' }}>جاري التحميل...</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '80px 0' }}>المنتج غير موجود</div>;

  const name = product.name?.[lang] || product.name?.ar;
  const description = product.description?.[lang] || product.description?.ar;
  const category = product.category?.[lang] || product.category?.ar;
  const effectivePrice = product.sellingPrice * (1 - (product.discount || 0) / 100);

  const handleAdd = () => {
    dispatch({ type: 'ADD', item: product });
    toast.success(lang === 'ar' ? 'تمت الإضافة للسلة ✓' : 'Added to cart ✓');
  };

  return (
    <>
      <Helmet>
        <title>{name} — ABC الحاوي</title>
        <meta name="description" content={product.metaDescription || description?.substring(0, 160)} />
        <meta property="og:title" content={product.metaTitle || name} />
        <meta property="og:image" content={product.images?.[0]?.url} />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org', '@type': 'Product', name,
          image: product.images?.map(i => i.url), description,
          offers: { '@type': 'Offer', price: effectivePrice.toFixed(2), priceCurrency: 'EGP',
            availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' },
        })}</script>
      </Helmet>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginBottom: 40 }}>
        <div>
          <div style={{ borderRadius: 14, overflow: 'hidden', aspectRatio: '1', background: '#faf5f5', marginBottom: 12 }}>
            <img src={product.images?.[mainImage]?.url || '/placeholder.jpg'} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {product.images.map((img, i) => (
                <img key={i} src={img.url} alt="" onClick={() => setMainImage(i)}
                  style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: i === mainImage ? '2px solid #f8ad9d' : '2px solid transparent' }} />
              ))}
            </div>
          )}
        </div>

        <div>
          <p style={{ color: '#f8ad9d', fontWeight: 600, margin: '0 0 6px' }}>{category}</p>
          <h1 style={{ color: '#1a3a5c', margin: '0 0 12px', fontSize: 26 }}>{name}</h1>
          {product.averageRating > 0 && (
            <div style={{ color: '#f39c12', fontSize: 18, marginBottom: 12 }}>
              {'★'.repeat(Math.round(product.averageRating))}{'☆'.repeat(5 - Math.round(product.averageRating))}
              <span style={{ color: '#888', fontSize: 14, marginInlineStart: 8 }}>({product.reviewCount} {t('reviews')})</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 16 }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: '#1a3a5c' }}>{effectivePrice.toFixed(0)} ج.م</span>
            {product.discount > 0 && (
              <>
                <span style={{ textDecoration: 'line-through', color: '#aaa', fontSize: 18 }}>{product.sellingPrice} ج.م</span>
                <span style={{ background: '#ffeaa7', color: '#d35400', padding: '2px 8px', borderRadius: 12, fontSize: 13, fontWeight: 600 }}>وفر {product.discount}%</span>
              </>
            )}
          </div>
          <p style={{ color: '#555', lineHeight: 1.7, marginBottom: 24 }}>{description}</p>
          <p style={{ marginBottom: 20, fontWeight: 600, color: product.stock === 0 ? '#e74c3c' : product.stock < 5 ? '#e74c3c' : '#27ae60' }}>
            {product.stock === 0 ? '✗ غير متوفر' : product.stock < 5 ? `⚠ ${product.stock} قطع فقط!` : `✓ متوفر`}
          </p>
          <button onClick={handleAdd} disabled={product.stock < 1} style={{ width: '100%', padding: '14px', background: product.stock < 1 ? '#ccc' : '#1a3a5c', color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: product.stock < 1 ? 'not-allowed' : 'pointer', marginBottom: 10 }}>
            {product.stock < 1 ? t('outOfStock') : t('addToCart')}
          </button>
          <p style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>{t('returnPolicy')}</p>
        </div>
      </div>
      <ReviewSection productId={product._id} />
    </>
  );
}
