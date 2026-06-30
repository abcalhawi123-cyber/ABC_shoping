import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLang } from '../context/LangContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getCategories } from '../api';

const BG = '#6D1A36'; // Burgundy

export default function Header() {
  const { t, lang, toggleLang, brand } = useLang();
  const { itemCount } = useCart();
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    getCategories().then(r => setCategories(r.data.data)).catch(() => {});
  }, []);

  const search = e => {
    e.preventDefault();
    if (q.trim()) { navigate(`/products?q=${encodeURIComponent(q.trim())}`); setQ(''); setMenuOpen(false); }
  };

  const close = () => { setMenuOpen(false); setCatOpen(false); };

  return (
    <header style={{ background: BG, color: '#fff', position: 'sticky', top: 0, zIndex: 1000, boxShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', gap: 12, height: 60, padding: '0 16px' }}>

        {/* Logo — brand name never translates */}
        <Link to="/" onClick={close} style={{ textDecoration: 'none', flexShrink: 0 }}>
          <span style={{ fontSize: 20, fontWeight: 800, color: '#fff', letterSpacing: 1 }}>{brand}</span>
        </Link>

        {/* Search */}
        <form onSubmit={search} style={{ flex: 1, minWidth: 0 }} className="desktop-search">
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={t('search')}
            style={{ width: '100%', padding: '8px 14px', borderRadius: 24, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 13, outline: 'none', boxSizing: 'border-box' }} />
        </form>

        {/* Right nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>

          {/* Categories dropdown — desktop */}
          <div style={{ position: 'relative' }} className="desktop-nav">
            <button onClick={() => setCatOpen(o => !o)}
              style={{ ...N, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 8, cursor: 'pointer' }}>
              {t('categories')} ▾
            </button>
            {catOpen && (
              <div style={{ position: 'absolute', top: '100%', right: 0, minWidth: 180, background: '#fff', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', zIndex: 200, overflow: 'hidden', marginTop: 6 }}>
                {categories.map(c => (
                  <Link key={c._id} to={`/products?category=${encodeURIComponent(c.name.ar)}`} onClick={() => { setCatOpen(false); }}
                    style={{ display: 'block', padding: '11px 16px', color: '#1a1a1a', textDecoration: 'none', fontSize: 14, borderBottom: '1px solid #f5f5f5', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f9f0f3'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    {lang === 'ar' ? c.name.ar : c.name.en}
                  </Link>
                ))}
                {categories.length === 0 && <p style={{ padding: '12px 16px', color: '#aaa', fontSize: 13, margin: 0 }}>{t('loading')}</p>}
              </div>
            )}
          </div>

          <Link to="/products" style={N} className="desktop-nav" onClick={close}>{t('products')}</Link>

          {/* Cart */}
          <Link to="/cart" style={{ ...N, position: 'relative' }} onClick={close}>
            🛒
            {itemCount > 0 && <span style={{ position: 'absolute', top: -6, right: -6, background: '#fff', color: BG, borderRadius: '50%', width: 17, height: 17, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{itemCount}</span>}
          </Link>

          {user ? (
            <>
              <Link to="/my-orders" style={N} className="desktop-nav" onClick={close}>📦</Link>
              <button onClick={() => { logoutUser(); close(); }} style={{ ...N, background: 'none', border: 'none', cursor: 'pointer' }} className="desktop-nav">{t('logout')}</button>
            </>
          ) : (
            <Link to="/login" style={N} className="desktop-nav" onClick={close}>{t('login')}</Link>
          )}

          {/* Lang toggle */}
          <button onClick={toggleLang} style={{ padding: '5px 10px', background: 'rgba(255,255,255,0.2)', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 14, fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>

          {/* Hamburger */}
          <button onClick={() => setMenuOpen(o => !o)} className="hamburger"
            style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 22, padding: '4px', display: 'none' }}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="mobile-search" style={{ padding: '0 16px 10px', display: 'none' }}>
        <form onSubmit={search}>
          <input value={q} onChange={e => setQ(e.target.value)} placeholder={t('search')}
            style={{ width: '100%', padding: '9px 16px', borderRadius: 24, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.15)', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
        </form>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <nav style={{ background: '#5a1530', padding: '8px 0 12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {/* Categories on mobile */}
          <p style={{ padding: '8px 16px 4px', fontSize: 12, color: 'rgba(255,255,255,0.5)', margin: 0, fontWeight: 600 }}>{t('categories')}</p>
          {categories.map(c => (
            <Link key={c._id} to={`/products?category=${encodeURIComponent(c.name.ar)}`} onClick={close}
              style={{ ...MN, paddingRight: 28 }}>
              {lang === 'ar' ? c.name.ar : c.name.en}
            </Link>
          ))}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', margin: '8px 0' }} />
          <Link to="/products" onClick={close} style={MN}>{t('products')}</Link>
          <Link to="/cart" onClick={close} style={MN}>🛒 {t('cart')} {itemCount > 0 && `(${itemCount})`}</Link>
          {user ? (
            <>
              <Link to="/my-orders" onClick={close} style={MN}>📦 {t('myOrders')}</Link>
              <button onClick={() => { logoutUser(); close(); }} style={{ ...MN, background: 'none', border: 'none', cursor: 'pointer', textAlign: lang === 'ar' ? 'right' : 'left', width: '100%' }}>{t('logout')}</button>
            </>
          ) : (
            <Link to="/login" onClick={close} style={MN}>{t('login')}</Link>
          )}
        </nav>
      )}

      <style>{`
        @media (max-width: 640px) {
          .hamburger { display: block !important; }
          .desktop-nav { display: none !important; }
          .desktop-search { display: none !important; }
          .mobile-search { display: block !important; }
        }
      `}</style>
    </header>
  );
}

const N = { color: '#fff', textDecoration: 'none', padding: '6px 8px', borderRadius: 6, fontSize: 13, position: 'relative', whiteSpace: 'nowrap' };
const MN = { color: '#fff', textDecoration: 'none', padding: '12px 16px', fontSize: 15, borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'block' };
