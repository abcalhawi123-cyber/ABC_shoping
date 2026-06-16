import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';
import i18n from '../i18n';

export default function ProductCard({ product }) {
  const { t } = useTranslation();
  const { dispatch } = useCart();
  const lang = i18n.language;

  const effectivePrice = product.sellingPrice * (1 - (product.discount || 0) / 100);
  const name = product.name?.[lang] || product.name?.ar;
  const category = product.category?.[lang] || product.category?.ar;

  const handleAdd = (e) => {
    e.preventDefault();
    if (product.stock < 1) return;
    dispatch({ type: 'ADD', item: product });
    toast.success(lang === 'ar' ? 'تمت الإضافة للسلة ✓' : 'Added to cart ✓');
  };

  return (
    <Link to={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{
        background: '#fff',
        borderRadius: 14,
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
        border: '1px solid #f0e8e8',
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
        onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)'; }}
      >
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '1', overflow: 'hidden', background: '#faf5f5' }}>
          <img
            src={product.images?.[0]?.url || '/placeholder.jpg'}
            alt={name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
          {product.discount > 0 && (
            <span style={{
              position: 'absolute', top: 10, right: lang === 'ar' ? 10 : 'auto', left: lang === 'en' ? 10 : 'auto',
              background: '#f8ad9d', color: '#1a3a5c',
              padding: '3px 8px', borderRadius: 12, fontSize: 12, fontWeight: 700,
            }}>
              -{product.discount}%
            </span>
          )}
          {product.stock < 1 && (
            <div style={{
              position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>{t('outOfStock')}</span>
            </div>
          )}
          {/* Low stock warning */}
          {product.stock > 0 && product.stock < 5 && (
            <span style={{
              position: 'absolute', bottom: 8, right: lang === 'ar' ? 8 : 'auto', left: lang === 'en' ? 8 : 'auto',
              background: '#e74c3c', color: '#fff',
              padding: '2px 7px', borderRadius: 10, fontSize: 11,
            }}>
              {lang === 'ar' ? `${product.stock} قطع فقط!` : `${product.stock} left!`}
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: '12px 14px' }}>
          <p style={{ fontSize: 12, color: '#f8ad9d', margin: '0 0 4px', fontWeight: 600 }}>{category}</p>
          <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, lineHeight: 1.3, color: '#1a3a5c' }}>
            {name}
          </h3>

          {/* Rating */}
          {product.averageRating > 0 && (
            <div style={{ fontSize: 12, color: '#f39c12', marginBottom: 6 }}>
              {'★'.repeat(Math.round(product.averageRating))}{'☆'.repeat(5 - Math.round(product.averageRating))}
              <span style={{ color: '#888', marginInlineStart: 4 }}>({product.reviewCount})</span>
            </div>
          )}

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#1a3a5c' }}>
              {effectivePrice.toFixed(0)} ج.م
            </span>
            {product.discount > 0 && (
              <span style={{ fontSize: 13, textDecoration: 'line-through', color: '#aaa' }}>
                {product.sellingPrice} ج.م
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            disabled={product.stock < 1}
            style={{
              width: '100%',
              padding: '9px',
              background: product.stock < 1 ? '#ccc' : '#1a3a5c',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 14,
              cursor: product.stock < 1 ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {product.stock < 1 ? t('outOfStock') : t('addToCart')}
          </button>
        </div>
      </div>
    </Link>
  );
}
