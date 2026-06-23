import { Link } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

export default function ProductCard({ product }) {
  const { t, lang } = useLang();
  const { dispatch } = useCart();
  const price = product.sellingPrice * (1 - (product.discount || 0) / 100);
  const name = product.name?.[lang] || product.name?.ar || '';
  const cat = product.category?.[lang] || product.category?.ar || '';

  const add = e => {
    e.preventDefault();
    if (product.stock < 1) return;
    dispatch({ type: 'ADD', item: product });
    toast.success(lang === 'ar' ? 'تمت الإضافة ✓' : 'Added ✓');
  };

  return (
    <Link to={`/products/${product.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', border: '1px solid #f0e8e8', transition: 'transform 0.2s' }}
        onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={e => e.currentTarget.style.transform = ''}>
        <div style={{ position: 'relative', aspectRatio: '1', background: '#faf5f5' }}>
          <img src={product.images?.[0]?.url || ''} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
          {product.discount > 0 && (
            <span style={{ position: 'absolute', top: 10, right: 10, background: '#f8ad9d', color: '#1a3a5c', padding: '3px 8px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
              -{product.discount}%
            </span>
          )}
          {product.stock < 1 && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 700 }}>{t('outOfStock')}</span>
            </div>
          )}
          {product.stock > 0 && product.stock < 5 && (
            <span style={{ position: 'absolute', bottom: 8, right: 8, background: '#e74c3c', color: '#fff', padding: '2px 7px', borderRadius: 10, fontSize: 11 }}>
              {product.stock} {t('onlyLeft')}
            </span>
          )}
        </div>
        <div style={{ padding: '12px 14px' }}>
          <p style={{ fontSize: 12, color: '#f8ad9d', margin: '0 0 4px', fontWeight: 600 }}>{cat}</p>
          <h3 style={{ margin: '0 0 8px', fontSize: 15, fontWeight: 600, color: '#1a3a5c' }}>{name}</h3>
          {product.averageRating > 0 && (
            <div style={{ fontSize: 12, color: '#f39c12', marginBottom: 6 }}>
              {'★'.repeat(Math.round(product.averageRating))}{'☆'.repeat(5 - Math.round(product.averageRating))}
              <span style={{ color: '#888', marginInlineStart: 4 }}>({product.reviewCount})</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: '#1a3a5c' }}>{price.toFixed(0)} ج.م</span>
            {product.discount > 0 && <span style={{ fontSize: 13, textDecoration: 'line-through', color: '#aaa' }}>{product.sellingPrice} ج.م</span>}
          </div>
          <button onClick={add} disabled={product.stock < 1} style={{ width: '100%', padding: '9px', background: product.stock < 1 ? '#ccc' : '#1a3a5c', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: product.stock < 1 ? 'not-allowed' : 'pointer' }}>
            {product.stock < 1 ? t('outOfStock') : t('addToCart')}
          </button>
        </div>
      </div>
    </Link>
  );
}
