import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLang } from '../context/LangContext';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';

const BG = '#6D1A36';

const BADGES = {
  ar: [
    { icon:'🔄', t:'إرجاع مجاني 15 يوم', s:'من تاريخ الطلب' },
    { icon:'🚚', t:'شحن لكل مصر', s:'عبر البريد المصري' },
    { icon:'💳', t:'دفع آمن 100%', s:'كاش، InstaPay، بطاقة' },
    { icon:'🎁', t:'تغليف هدايا', s:'مجاناً لكل طلب' },
  ],
  en: [
    { icon:'🔄', t:'Free 15-Day Returns', s:'From order date' },
    { icon:'🚚', t:'Ship All Over Egypt', s:'Via Egypt Post' },
    { icon:'💳', t:'100% Secure Payment', s:'Cash, InstaPay, Card' },
    { icon:'🎁', t:'Gift Wrapping', s:'Free on every order' },
  ],
};

export default function Home() {
  const { lang, t, brand } = useLang();
  const [featured, setFeatured] = useState([]);
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    getProducts({ sort:'newest', limit:8 }).then(r => setFeatured(r.data.data)).catch(() => {});
    getProducts({ sort:'popular', limit:4 }).then(r => setPopular(r.data.data)).catch(() => {});
  }, []);

  const badges = BADGES[lang] || BADGES.ar;

  return (
    <>
      <Helmet>
        <title>{brand} — {lang==='ar'?'stock store':"stock Store"}</title>
        <meta name="description" content={lang==='ar'?'أفضل متجر للهدايا و المنتجات المتنوعه.':'Egypt\'s best gifts & more products store.'} />
      </Helmet>

      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg,${BG},#9b2a4f)`, borderRadius:16, padding:'48px 24px', textAlign:'center', color:'#fff', marginBottom:40, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-30, right:-30, width:150, height:150, background:'rgba(255,255,255,0.06)', borderRadius:'50%' }} />
        <h1 style={{ fontSize:'clamp(28px,6vw,44px)', margin:'0 0 10px', fontWeight:800, letterSpacing:1 }}>{brand}</h1>
        <p style={{ fontSize:'clamp(14px,3vw,18px)', opacity:0.85, margin:'0 0 24px' }}>
          {lang==='ar'?'متجرك الأول للألعاب والهدايا و المنتجات المتنوعه':'Your #1 destination for toys & gifts & more products!'}
        </p>
        <Link to="/products" style={{ display:'inline-block', background:'#fff', color:BG, padding:'13px 32px', borderRadius:30, textDecoration:'none', fontWeight:700, fontSize:16 }}>
          {t('shopNow')} 🛍
        </Link>
      </div>

      {/* Popular */}
      {popular.length > 0 && (
        <div style={{ marginBottom:40 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h2 style={{ color:BG, margin:0, fontSize:20 }}>🔥 {lang==='ar'?'الأكثر مبيعاً':'Best Sellers'}</h2>
            <Link to="/products?sort=popular" style={{ color:BG, textDecoration:'none', fontWeight:600, fontSize:14 }}>{lang==='ar'?'عرض الكل ←':'View All →'}</Link>
          </div>
          <div className="products-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:16 }}>
            {popular.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}

      {/* Newest */}
      <div style={{ marginBottom:40 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
          <h2 style={{ color:BG, margin:0, fontSize:20 }}>✨ {lang==='ar'?'أحدث المنتجات':'Latest Products'}</h2>
          <Link to="/products" style={{ color:BG, textDecoration:'none', fontWeight:600, fontSize:14 }}>{lang==='ar'?'عرض الكل ←':'View All →'}</Link>
        </div>
        <div className="products-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:16 }}>
          {featured.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      </div>

      {/* Trust badges */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, background:'#fdf5f7', borderRadius:16, padding:'24px 16px' }}>
        {badges.map(b => (
          <div key={b.t} style={{ textAlign:'center', padding:'8px 4px' }}>
            <span style={{ fontSize:28 }}>{b.icon}</span>
            <p style={{ margin:'6px 0 2px', fontWeight:700, color:BG, fontSize:'clamp(12px,2.5vw,14px)' }}>{b.t}</p>
            <p style={{ margin:0, fontSize:'clamp(11px,2vw,13px)', color:'#888' }}>{b.s}</p>
          </div>
        ))}
      </div>
    </>
  );
}
