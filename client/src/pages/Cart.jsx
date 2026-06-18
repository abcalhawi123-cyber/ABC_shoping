import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLang } from '../context/LangContext';
import { useCart } from '../context/CartContext';

export default function Cart() {
  const { t, lang } = useLang();
  const { cart, dispatch, subtotal } = useCart();

  if (!cart || cart.length === 0) return (
    <>
      <Helmet><title>السلة — ABC الحاوي</title></Helmet>
      <div style={{ textAlign: 'center', padding: '80px 0' }}>
        <p style={{ fontSize: 64 }}>🛒</p>
        <h2 style={{ color: '#1a3a5c' }}>{t('cartEmpty')}</h2>
        <Link to="/products" style={{ display: 'inline-block', marginTop: 16, padding: '12px 28px', background: '#1a3a5c', color: '#fff', textDecoration: 'none', borderRadius: 10, fontWeight: 600 }}>تسوق الآن</Link>
      </div>
    </>
  );

  return (
    <>
      <Helmet><title>السلة — ABC الحاوي</title></Helmet>
      <h1 style={{ color: '#1a3a5c', marginBottom: 24 }}>🛒 {t('cart')}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 28, alignItems: 'start' }}>
        <div>
          {cart.map(item => {
            const name = item.name?.[lang] || item.name?.ar || '';
            const price = item.sellingPrice * (1 - (item.discount || 0) / 100);
            return (
              <div key={item._id} style={{ background: '#fff', borderRadius: 12, padding: 16, marginBottom: 14, display: 'flex', gap: 16, alignItems: 'center', boxShadow: '0 1px 8px rgba(0,0,0,0.06)', border: '1px solid #f0e8e8' }}>
                <img src={item.images?.[0]?.url || ''} alt={name} style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 10 }} />
                <div style={{ flex: 1 }}><h3 style={{ margin: '0 0 4px', color: '#1a3a5c', fontSize: 15 }}>{name}</h3></div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <button onClick={() => dispatch({ type: 'UPDATE_QTY', id: item._id, qty: item.qty - 1 })} style={QB}>−</button>
                  <span style={{ fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{item.qty}</span>
                  <button onClick={() => dispatch({ type: 'UPDATE_QTY', id: item._id, qty: item.qty + 1 })} style={QB}>+</button>
                </div>
                <div style={{ minWidth: 80, textAlign: 'left' }}>
                  <p style={{ margin: 0, fontWeight: 700, color: '#1a3a5c' }}>{(price * item.qty).toFixed(0)} ج.م</p>
                  {item.discount > 0 && <p style={{ margin: 0, fontSize: 12, color: '#aaa', textDecoration: 'line-through' }}>{(item.sellingPrice * item.qty).toFixed(0)} ج.م</p>}
                </div>
                <button onClick={() => dispatch({ type: 'REMOVE', id: item._id })} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#e74c3c' }}>🗑</button>
              </div>
            );
          })}
        </div>
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.08)', border: '1px solid #f0e8e8', position: 'sticky', top: 90 }}>
          <h3 style={{ color: '#1a3a5c', margin: '0 0 18px' }}>ملخص السلة</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}><span>{t('subtotal')}</span><span>{subtotal.toFixed(0)} ج.م</span></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, color: '#888', fontSize: 14 }}><span>{t('shippingFee')}</span><span>تُحدد عند الشراء</span></div>
          <hr style={{ border: 'none', borderTop: '1px solid #eee', margin: '0 0 16px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 18, marginBottom: 20 }}><span>{t('total')}</span><span style={{ color: '#1a3a5c' }}>{subtotal.toFixed(0)}+ ج.م</span></div>
          <Link to="/checkout" style={{ display: 'block', textAlign: 'center', background: '#1a3a5c', color: '#fff', padding: 14, borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{t('checkout')} ←</Link>
          <Link to="/products" style={{ display: 'block', textAlign: 'center', color: '#888', fontSize: 14, textDecoration: 'none' }}>← متابعة التسوق</Link>
        </div>
      </div>
    </>
  );
}
const QB = { width: 32, height: 32, border: '1px solid #ddd', borderRadius: 6, background: '#f5f5f5', cursor: 'pointer', fontSize: 16, fontWeight: 700 };
