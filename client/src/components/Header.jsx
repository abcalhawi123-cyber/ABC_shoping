import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { t, lang, toggleLang } = useLang();
  const { itemCount } = useCart();
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState('');

  const search = e => {
    e.preventDefault();
    if (q.trim()) { navigate(`/products?q=${encodeURIComponent(q.trim())}`); setQ(''); }
  };

  return (
    <header style={{ background: '#1a3a5c', color: '#fff', padding: '0 20px', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 14, height: 64 }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontSize: 20, fontWeight: 700, color: '#f8ad9d', whiteSpace: 'nowrap' }}>ABC {lang === 'ar' ? 'الحاوي' : 'Al-Hawi'}</span>
        </Link>

        {/* Search bar */}
        <form onSubmit={search} style={{ flex: 1, minWidth: 100 }}>
          <input
            value={q}
            onChange={e => setQ(e.target.value)}
            placeholder={t('search')}
            style={{ width: '100%', padding: '8px 14px', borderRadius: 24, border: '1px solid rgba(248,173,157,0.4)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
          />
        </form>

        {/* Navigation links */}
        <nav style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>

          <Link to="/products" style={N}>{t('products')}</Link>

          {/* Cart with badge */}
          <Link to="/cart" style={{ ...N, position: 'relative' }}>
            🛒 {t('cart')}
            {itemCount > 0 && (
              <span style={{ position: 'absolute', top: -6, right: lang === 'ar' ? -6 : 'auto', left: lang === 'en' ? -6 : 'auto', background: '#f8ad9d', color: '#1a3a5c', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>
                {itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <>
              {/* My Orders */}
              <Link to="/my-orders" style={N} title={t('myOrders')}>
                📦 {t('myOrders')}
              </Link>
              {/* Logout */}
              <button onClick={logoutUser} style={{ ...N, background: 'none', border: 'none', cursor: 'pointer' }}>
                {t('logout')}
              </button>
            </>
          ) : (
            <Link to="/login" style={N}>{t('login')}</Link>
          )}

          {/* Language toggle */}
          <button
            onClick={toggleLang}
            style={{ padding: '5px 12px', background: '#f8ad9d', color: '#1a3a5c', border: 'none', borderRadius: 14, fontWeight: 700, cursor: 'pointer', fontSize: 12, flexShrink: 0 }}
          >
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
        </nav>
      </div>
    </header>
  );
}

const N = {
  color: '#fff',
  textDecoration: 'none',
  padding: '6px 8px',
  borderRadius: 6,
  fontSize: 13,
  position: 'relative',
  whiteSpace: 'nowrap',
};
