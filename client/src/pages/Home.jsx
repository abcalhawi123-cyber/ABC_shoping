import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    getProducts({ sort: 'newest', limit: 8 }).then(r => setFeatured(r.data.data)).catch(() => {});
    getProducts({ sort: 'popular', limit: 4 }).then(r => setPopular(r.data.data)).catch(() => {});
  }, []);

  return (
    <>
      <Helmet><title>ABC الحاوي — ألعاب الأطفال</title></Helmet>
      <div style={{ background: 'linear-gradient(135deg,#1a3a5c,#2c5f8f)', borderRadius: 20, padding: '60px 40px', textAlign: 'center', color: '#fff', marginBottom: 48 }}>
        <h1 style={{ fontSize: 40, margin: '0 0 12px' }}>🧸 ABC الحاوي</h1>
        <p style={{ fontSize: 20, opacity: 0.9, margin: '0 0 28px' }}>متجر ألعاب الأطفال الأول — هدايا تدوم في القلب</p>
        <Link to="/products" style={{ display: 'inline-block', background: '#f8ad9d', color: '#1a3a5c', padding: '14px 36px', borderRadius: 30, textDecoration: 'none', fontWeight: 700, fontSize: 17 }}>تسوق الآن 🛍</Link>
      </div>

      <div style={{ marginBottom: 48 }}>
        <h2 style={{ color: '#1a3a5c', marginBottom: 20 }}>تسوق حسب الفئة</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 14 }}>
          {[
            { emoji: '🧸', label: 'ألعاب قطنية', q: 'ألعاب قطنية' },
            { emoji: '🎀', label: 'أقمشة أطفال', q: 'أقمشة أطفال' },
            { emoji: '✨', label: 'أخرى', q: 'أخرى' },
          ].map(c => (
            <Link key={c.q} to={`/products?category=${c.q}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: '20px 12px', textAlign: 'center', border: '2px solid #f0e8e8', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#f8ad9d'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f0e8e8'; e.currentTarget.style.transform = ''; }}>
                <span style={{ fontSize: 36 }}>{c.emoji}</span>
                <p style={{ margin: '8px 0 0', fontWeight: 600, color: '#1a3a5c', fontSize: 15 }}>{c.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {popular.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ color: '#1a3a5c', margin: 0 }}>🔥 الأكثر مبيعاً</h2>
            <Link to="/products?sort=popular" style={{ color: '#f8ad9d', textDecoration: 'none', fontWeight: 600 }}>عرض الكل ←</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
            {popular.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}

      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: '#1a3a5c', margin: 0 }}>✨ أحدث المنتجات</h2>
          <Link to="/products" style={{ color: '#f8ad9d', textDecoration: 'none', fontWeight: 600 }}>عرض الكل ←</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
          {featured.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 20, background: '#faf5f5', borderRadius: 16, padding: 28 }}>
        {[
          { icon: '🔄', t: 'إرجاع مجاني 15 يوم', s: 'من تاريخ الطلب' },
          { icon: '🚚', t: 'شحن لكل مصر', s: 'عبر البريد المصري' },
          { icon: '💳', t: 'دفع آمن 100%', s: 'كاش، InstaPay، بطاقة' },
          { icon: '🎁', t: 'تغليف هدايا', s: 'مجاناً لكل طلب' },
        ].map(b => (
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
