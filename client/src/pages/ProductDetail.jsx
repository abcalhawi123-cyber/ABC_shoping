import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLang } from '../context/LangContext';
import { useCart } from '../context/CartContext';
import { getProduct } from '../api';
import ReviewSection from '../components/ReviewSection';
import toast from 'react-hot-toast';

const BG = '#6D1A36';

export default function ProductDetail() {
  const { slug } = useParams();
  const { t, lang, brand } = useLang();
  const { dispatch } = useCart();
  const [product, setProduct] = useState(null);
  const [img, setImg] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState(null);

  useEffect(() => {
    setLoading(true);
    getProduct(slug)
      .then(r => {
        setProduct(r.data.data);
        // Auto-select first color if variants exist
        if (r.data.data.colorVariants?.length > 0) {
          setSelectedColor(r.data.data.colorVariants[0].color);
        }
      })
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div style={{ textAlign: 'center', padding: '80px 20px', color: '#888' }}>{t('loading')}</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '80px 20px', color: '#c0392b' }}>{lang === 'ar' ? 'المنتج غير موجود' : 'Product not found'}</div>;

  const name = product.name?.[lang] || product.name?.ar || '';
  const desc = product.description?.[lang] || product.description?.ar || '';
  const cat = product.category?.[lang] || product.category?.ar || '';
  const price = product.sellingPrice * (1 - (product.discount || 0) / 100);

  // Get stock for selected color variant
  const hasVariants = product.colorVariants && product.colorVariants.length > 0;
  const selectedVariant = hasVariants ? product.colorVariants.find(v => v.color === selectedColor) : null;
  const availableStock = hasVariants ? (selectedVariant?.quantity || 0) : product.stock;

  const stockDisplay = () => {
    if (availableStock === 0) return { text: `✗ ${t('outOfStock')}`, color: '#c0392b' };
    if (availableStock < 5) return { text: `⚠ ${availableStock} ${t('onlyLeft')}`, color: '#c0392b' };
    return { text: `${t('availableQty')}: ${availableStock}`, color: '#27ae60' };
  };
  const stock = stockDisplay();

  const handleAdd = () => {
    if (availableStock < 1) return;
    if (hasVariants && !selectedColor) return toast.error(lang === 'ar' ? 'اختر اللون أولاً' : 'Select a color first');
    dispatch({ type: 'ADD', item: { ...product, selectedColor, stock: availableStock } });
    toast.success(lang === 'ar' ? 'تمت الإضافة ✓' : 'Added ✓');
  };

  return (
    <>
      <Helmet>
        <title>{name} — {brand}</title>
        <meta name="description" content={product.metaDescription || desc.substring(0, 160)} />
        <meta property="og:title" content={name} />
        <meta property="og:image" content={product.images?.[0]?.url} />
        <meta property="og:type" content="product" />
      </Helmet>

      <div className="grid-2col" style={{ marginBottom: 40 }}>
        {/* Images */}
        <div>
          <div style={{ borderRadius: 14, overflow: 'hidden', aspectRatio: '1', background: '#fdf5f7', marginBottom: 12 }}>
            <img src={product.images?.[img]?.url || ''} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {product.images.map((im, i) => (
                <img key={i} src={im.url} alt="" onClick={() => setImg(i)}
                  style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: i === img ? `2px solid ${BG}` : '2px solid #eee' }} />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <p style={{ color: BG, fontWeight: 600, margin: '0 0 6px', fontSize: 13 }}>{cat}</p>
          <h1 style={{ color: '#1a1a1a', margin: '0 0 12px', fontSize: 24, lineHeight: 1.3 }}>{name}</h1>

          {product.averageRating > 0 && (
            <div style={{ color: '#f39c12', fontSize: 17, marginBottom: 12 }}>
              {'★'.repeat(Math.round(product.averageRating))}{'☆'.repeat(5 - Math.round(product.averageRating))}
              <span style={{ color: '#888', fontSize: 13, marginInlineStart: 6 }}>({product.reviewCount} {t('reviews')})</span>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 28, fontWeight: 700, color: BG }}>{price.toFixed(0)} ج.م</span>
            {product.discount > 0 && (
              <>
                <span style={{ textDecoration: 'line-through', color: '#aaa', fontSize: 17 }}>{product.sellingPrice} ج.م</span>
                <span style={{ background: '#fdf5f7', color: BG, padding: '3px 10px', borderRadius: 12, fontSize: 13, fontWeight: 700, border: `1px solid ${BG}` }}>
                  {lang === 'ar' ? `وفر ${product.discount}%` : `Save ${product.discount}%`}
                </span>
              </>
            )}
          </div>

          <p style={{ color: '#555', lineHeight: 1.8, marginBottom: 16, fontSize: 15 }}>{desc}</p>

          {/* Color Variants */}
          {hasVariants && (
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontWeight: 700, color: '#333', marginBottom: 10, fontSize: 14 }}>{t('selectColor')}:</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {product.colorVariants.map(v => (
                  <button key={v.color} onClick={() => setSelectedColor(v.color)}
                    style={{
                      padding: '7px 16px',
                      border: `2px solid ${selectedColor === v.color ? BG : '#ddd'}`,
                      borderRadius: 8,
                      background: selectedColor === v.color ? '#fdf5f7' : '#fff',
                      color: selectedColor === v.color ? BG : '#555',
                      fontWeight: selectedColor === v.color ? 700 : 400,
                      cursor: v.quantity === 0 ? 'not-allowed' : 'pointer',
                      fontSize: 13,
                      opacity: v.quantity === 0 ? 0.5 : 1,
                      transition: 'all 0.15s',
                    }}>
                    {v.color}
                    {v.quantity === 0 && <span style={{ marginInlineStart: 4, fontSize: 10 }}>({t('outOfStock')})</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock for selected variant */}
          <p style={{ marginBottom: 18, fontWeight: 600, color: stock.color, fontSize: 14 }}>{stock.text}</p>

          <button onClick={handleAdd} disabled={availableStock < 1}
            style={{ width: '100%', padding: '14px', background: availableStock < 1 ? '#ccc' : BG, color: '#fff', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 700, cursor: availableStock < 1 ? 'not-allowed' : 'pointer', marginBottom: 10 }}>
            {availableStock < 1 ? t('outOfStock') : t('addToCart')}
          </button>
          <p style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>{t('returnPolicy')}</p>
        </div>
      </div>

      <ReviewSection productId={product._id} />
    </>
  );
}
