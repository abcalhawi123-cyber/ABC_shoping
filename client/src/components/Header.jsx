import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LangContext';

export default function Header() {
  const { t, lang, toggleLang } = useLang();
  const { itemCount } = useCart();
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header style={{ background: '#1a3a5c', color: '#fff', padding: '0 24px', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 16, height: 64 }}>
        <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontSize: 22, fontWeight: 700, color: '#f8ad9d', letterSpacing: 1 }}>ABC الحاوي</span>
        </Link>

        <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 180 }}>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('search')}
            style={{ width: '100%', padding: '9px 16px', borderRadius: 24, border: '1px solid rgba(248,173,157,0.4)', background: 'rgba(255,255,255,0.1)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
          />
        </form>

        <nav style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Link to="/products" style={navStyle}>{t('products')}</Link>
          <Link to="/cart" style={{ ...navStyle, position: 'relative' }}>
            🛒 {t('cart')}
            {itemCount > 0 && (
              <span style={{ position: 'absolute', top: -8, right: -8, background: '#f8ad9d', color: '#1a3a5c', borderRadius: '50%', width: 18, height: 18, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{itemCount}</span>
            )}
          </Link>
          {user ? (
            <button onClick={logoutUser} style={{ ...navStyle, background: 'none', border: 'none', cursor: 'pointer' }}>{t('logout')}</button>
          ) : (
            <Link to="/login" style={navStyle}>{t('login')}</Link>
          )}
          <button onClick={toggleLang} style={{ padding: '6px 12px', background: '#f8ad9d', color: '#1a3a5c', border: 'none', borderRadius: 16, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
        </nav>
      </div>
    </header>
  );
}

const navStyle = { color: '#fff', textDecoration: 'none', padding: '6px 10px', borderRadius: 6, fontSize: 14, position: 'relative', whiteSpace: 'nowrap' };
