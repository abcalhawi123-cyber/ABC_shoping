import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLang } from '../context/LangContext';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';

const CATS = {
  ar: [
    { emoji: '🧸', label: 'ألعاب قطنية', q: 'ألعاب قطنية' },
    { emoji: '🎀', label: 'أقمشة أطفال', q: 'أقمشة أطفال' },
    { emoji: '✨', label: 'أخرى', q: 'أخرى' },
  ],
  en: [
    { emoji: '🧸', label: 'Cotton Toys', q: 'ألعاب قطنية' },
    { emoji: '🎀', label: "Kids' Fabric", q: 'أقمشة أطفال' },
    { emoji: '✨', label: 'Other', q: 'أخرى' },
  ],
};

const BADGES = {
  ar: [
    { icon: '🔄', t: 'إرجاع مجاني 15 يوم', s: 'من تاريخ الطلب' },
    { icon: '🚚', t: 'شحن لكل مصر', s: 'عبر البريد المصري' },
    { icon: '💳', t: 'دفع آمن 100%', s: 'كاش، InstaPay، بطاقة' },
    { icon: '🎁', t: 'تغليف هدايا', s: 'مجاناً لكل طلب' },
  ],
  en: [
    { icon: '🔄', t: 'Free 15-Day Returns', s: 'From order date' },
    { icon: '🚚', t: 'Ship All Over Egypt', s: 'Via Egypt Post' },
    { icon: '💳', t: '100% Secure Payment', s: 'Cash, InstaPay, Card' },
    { icon: '🎁', t: 'Gift Wrapping', s: 'Free on every order' },
  ],
};

export default function Home() {
  const { lang, t } = useLang();
  const [featured, setFeatured] = useState([]);
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    getProducts({ sort: 'newest', limit: 8 }).then(r => setFeatured(r.data.data)).catch(() => {});
    getProducts({ sort: 'popular', limit: 4 }).then(r => setPopular(r.data.data)).catch(() => {});
  }, []);

  const cats = CATS[lang] || CATS.ar;
  const badges = BADGES[lang] || BADGES.ar;

  return (
    <>
      <Helmet>
        <title>ABC الحاوي — {lang === 'ar' ? 'ألعاب الأطفال' : "Children's Toys"}</title>
        <meta name="description" content={lang === 'ar' ? 'أفضل متجر ألعاب أطفال في مصر. ألعاب قطنية، أقمشة أطفال وأكثر. شحن لجميع محافظات مصر.' : "Egypt's best children's toy store. Cotton toys, kids fabric and more. Shipping all over Egypt."} />
      </Helmet>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(135deg, #1a3a5c 0%, #2c5f8f 100%)', borderRadius: 20, padding: '60px 40px', textAlign: 'center', color: '#fff', marginBottom: 48, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(248,173,157,0.1)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, background: 'rgba(248,173,157,0.08)', borderRadius: '50%' }} />
        <h1 style={{ fontSize: 38, margin: '0 0 12px', position: 'relative' }}>🧸 {lang === 'ar' ? 'ABC الحاوي' : 'ABC Al-Hawi'}</h1>
        <p style={{ fontSize: 18, opacity: 0.9, margin: '0 0 28px', position: 'relative' }}>
          {lang === 'ar' ? 'متجر ألعاب الأطفال الأول — هدايا تدوم في القلب' : "Egypt's #1 children's toy store — Gifts that last in the heart"}
        </p>
        <Link to="/products" style={{ display: 'inline-block', background: '#f8ad9d', color: '#1a3a5c', padding: '14px 36px', borderRadius: 30, textDecoration: 'none', fontWeight: 700, fontSize: 17, position: 'relative' }}>
          {t('shopNow')} 🛍
        </Link>
      </div>

      {/* Categories */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ color: '#1a3a5c', marginBottom: 20 }}>
          {lang === 'ar' ? 'تسوق حسب الفئة' : 'Shop by Category'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px,1fr))', gap: 14 }}>
          {cats.map(c => (
            <Link key={c.q} to={`/products?category=${encodeURIComponent(c.q)}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: '24px 12px', textAlign: 'center', border: '2px solid #f0e8e8', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#f8ad9d'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f0e8e8'; e.currentTarget.style.transform = ''; }}>
                <span style={{ fontSize: 40 }}>{c.emoji}</span>
                <p style={{ margin: '10px 0 0', fontWeight: 600, color: '#1a3a5c', fontSize: 15 }}>{c.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular */}
      {popular.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ color: '#1a3a5c', margin: 0 }}>🔥 {lang === 'ar' ? 'الأكثر مبيعاً' : 'Best Sellers'}</h2>
            <Link to="/products?sort=popular" style={{ color: '#f8ad9d', textDecoration: 'none', fontWeight: 600 }}>
              {lang === 'ar' ? 'عرض الكل ←' : 'View All →'}
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
            {popular.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}

      {/* Newest */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: '#1a3a5c', margin: 0 }}>✨ {lang === 'ar' ? 'أحدث المنتجات' : 'Latest Products'}</h2>
          <Link to="/products" style={{ color: '#f8ad9d', textDecoration: 'none', fontWeight: 600 }}>
            {lang === 'ar' ? 'عرض الكل ←' : 'View All →'}
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
          {featured.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      </div>

      {/* Trust badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20, background: '#faf5f5', borderRadius: 16, padding: 28 }}>
        {badges.map(b => (
          <div key={b.t} style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 32 }}>{b.icon}</span>
            <p style={{ margin: '8px 0 2px', fontWeight: 700, color: '#1a3a5c' }}>{b.t}</p>
            <p style={{ margin: 0, fontSize: 13, color: '#888' }}>{b.s}</p>
          </div>
        ))}
      </div>
    </>
  );
}
