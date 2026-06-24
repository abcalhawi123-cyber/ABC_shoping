import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLang } from '../context/LangContext';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { t, lang } = useLang();
  const { cart, dispatch, subtotal } = useCart();

  if (!cart || cart.length === 0) return (
    <>
      <Helmet><title>{t('cart')} — ABC الحاوي</title></Helmet>
      <div style={{ textAlign: 'center', padding: '80px 20px' }}>
        <p style={{ fontSize: 64 }}>🛒</p>
        <h2 style={{ color: '#1a3a5c' }}>{t('cartEmpty')}</h2>
        <Link to="/products" style={{ display: 'inline-block', marginTop: 16, padding: '12px 28px', background: '#1a3a5c', color: '#fff', textDecoration: 'none', borderRadius: 10, fontWeight: 600 }}>
          {t('shopNow')}
        </Link>
      </div>
    </>
  );

  return (
    <>
      <Helmet><title>{t('cart')} — ABC الحاوي</title></Helmet>
      <h1 style={{ color: '#1a3a5c', marginBottom: 24, fontSize: 22 }}>🛒 {t('cart')}</h1>

      {/* Responsive: stacks on mobile */}
      <div className="grid-cart">
        {/* Items */}
        <div>
          {cart.map(item => {
            const name = item.name?.[lang] || item.name?.ar || '';
            const price = item.sellingPrice * (1 - (item.discount || 0) / 100);
            return (
              <div key={item._id} style={{ background: '#fff', borderRadius: 12, padding: '12px 14px', marginBottom: 12, display: 'flex', gap: 12, alignItems: 'center', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f0e8e8' }}>
                <img src={item.images?.[0]?.url || ''} alt={name} style={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: '0 0 4px', color: '#1a3a5c', fontSize: 14, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                  <p style={{ margin: 0, fontSize: 12, color: '#888' }}>{item.category?.[lang] || item.category?.ar}</p>
                  {/* Price on mobile under name */}
                  <p style={{ margin: '4px 0 0', fontWeight: 700, color: '#1a3a5c', fontSize: 14 }}>{(price * item.qty).toFixed(0)} ج.م</p>
                </div>
                {/* Qty controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => dispatch({ type: 'UPDATE_QTY', id: item._id, qty: item.qty - 1 })} style={QB}>−</button>
                  <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center', fontSize: 14 }}>{item.qty}</span>
                  <button onClick={() => dispatch({ type: 'UPDATE_QTY', id: item._id, qty: item.qty + 1 })} style={QB}>+</button>
                </div>
                <button onClick={() => dispatch({ type: 'REMOVE', id: item._id })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#e74c3c', flexShrink: 0, padding: '4px' }}>🗑</button>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #f0e8e8' }}>
          <h3 style={{ color: '#1a3a5c', margin: '0 0 16px', fontSize: 17 }}>{t('cartSummary')}</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <span style={{ color: '#555' }}>{t('subtotal')}</span>
            <span style={{ fontWeight: 600 }}>{subtotal.toFixed(0)} ج.م</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, fontSize: 13 }}>
            <span style={{ color: '#555' }}>{t('shippingFee')}</span>
            <span style={{ color: '#888' }}>{t('shippingCalcAtCheckout')}</span>
          </div>
          <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '0 0 14px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, marginBottom: 6 }}>
            <span>{t('subtotal')}</span>
            <span style={{ color: '#1a3a5c' }}>{subtotal.toFixed(0)} ج.م</span>
          </div>
          <p style={{ fontSize: 12, color: '#aaa', margin: '0 0 16px', textAlign: 'center' }}>{t('shippingNote')}</p>
          <Link to="/checkout" style={{ display: 'block', textAlign: 'center', background: '#1a3a5c', color: '#fff', padding: '13px', borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 16, marginBottom: 10 }}>
            {t('checkout')} ←
          </Link>
          <Link to="/products" style={{ display: 'block', textAlign: 'center', color: '#888', fontSize: 14, textDecoration: 'none' }}>
            ← {t('continueShopping')}
          </Link>
        </div>
      </div>
    </>
  );
}

const QB = { width: 30, height: 30, border: '1px solid #ddd', borderRadius: 6, background: '#f5f5f5', cursor: 'pointer', fontSize: 16, fontWeight: 700 };
