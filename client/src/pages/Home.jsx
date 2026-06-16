// ============================================================
// HOME PAGE
// ============================================================
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    getProducts({ sort: 'newest', limit: 8 }).then(r => setFeatured(r.data.data));
    getProducts({ sort: 'popular', limit: 4 }).then(r => setPopular(r.data.data));
  }, []);

  return (
    <>
      <Helmet>
        <title>ABC الحاوي — ألعاب الأطفال</title>
        <meta name="description" content="أفضل متجر ألعاب أطفال في مصر. دباديب، ميداليات، شنط، عرائس، ألعاب ديزني وأكثر. شحن لجميع محافظات مصر." />
      </Helmet>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1a3a5c 0%, #2c5f8f 100%)',
        borderRadius: 20,
        padding: '60px 40px',
        textAlign: 'center',
        color: '#fff',
        marginBottom: 48,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: 'rgba(248,173,157,0.1)', borderRadius: '50%' }} />
        <div style={{ position: 'absolute', bottom: -60, left: -60, width: 300, height: 300, background: 'rgba(248,173,157,0.08)', borderRadius: '50%' }} />
        <h1 style={{ fontSize: 40, margin: '0 0 12px', position: 'relative' }}>🧸 ABC الحاوي</h1>
        <p style={{ fontSize: 20, opacity: 0.9, margin: '0 0 28px', position: 'relative' }}>متجر ألعاب الأطفال الأول — هدايا تدوم في القلب</p>
        <Link to="/products" style={{
          display: 'inline-block',
          background: '#f8ad9d', color: '#1a3a5c',
          padding: '14px 36px', borderRadius: 30,
          textDecoration: 'none', fontWeight: 700, fontSize: 17,
          position: 'relative',
        }}>
          تسوق الآن 🛍
        </Link>
      </div>

      {/* Categories */}
      <div style={{ marginBottom: 48 }}>
        <h2 style={{ color: '#1a3a5c', marginBottom: 20 }}>تسوق حسب الفئة</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
          {[
            { emoji: '🐻', label: 'دباديب', q: 'دباديب' },
            { emoji: '🔑', label: 'ميداليات', q: 'ميداليات' },
            { emoji: '👜', label: 'شنط', q: 'شنط' },
            { emoji: '📿', label: 'سلاسل', q: 'سلاسل' },
            { emoji: '🪆', label: 'عرائس', q: 'عرائس' },
            { emoji: '🎮', label: 'ألعاب ديزني', q: 'ديزني' },
          ].map(cat => (
            <Link key={cat.q} to={`/products?category=${cat.q}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff', borderRadius: 14, padding: '20px 12px',
                textAlign: 'center', border: '2px solid #f0e8e8',
                transition: 'all 0.2s', cursor: 'pointer',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#f8ad9d'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f0e8e8'; e.currentTarget.style.transform = ''; }}
              >
                <span style={{ fontSize: 36 }}>{cat.emoji}</span>
                <p style={{ margin: '8px 0 0', fontWeight: 600, color: '#1a3a5c', fontSize: 15 }}>{cat.label}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Popular */}
      {popular.length > 0 && (
        <div style={{ marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ color: '#1a3a5c', margin: 0 }}>🔥 الأكثر مبيعاً</h2>
            <Link to="/products?sort=popular" style={{ color: '#f8ad9d', textDecoration: 'none', fontWeight: 600 }}>عرض الكل ←</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {popular.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}

      {/* Newest */}
      <div style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ color: '#1a3a5c', margin: 0 }}>✨ أحدث المنتجات</h2>
          <Link to="/products" style={{ color: '#f8ad9d', textDecoration: 'none', fontWeight: 600 }}>عرض الكل ←</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {featured.map(p => <ProductCard key={p._id} product={p} />)}
        </div>
      </div>

      {/* Trust badges */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, background: '#faf5f5', borderRadius: 16, padding: '28px' }}>
        {[
          { icon: '🔄', title: 'إرجاع مجاني 15 يوم', sub: 'من تاريخ الطلب' },
          { icon: '🚚', title: 'شحن لكل مصر', sub: 'عبر البريد المصري' },
          { icon: '💳', title: 'دفع آمن 100%', sub: 'كاش، InstaPay، بطاقة' },
          { icon: '🎁', title: 'تغليف هدايا', sub: 'مجاناً لكل طلب' },
        ].map(b => (
          <div key={b.title} style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 32 }}>{b.icon}</span>
            <p style={{ margin: '8px 0 2px', fontWeight: 700, color: '#1a3a5c' }}>{b.title}</p>
            <p style={{ margin: 0, fontSize: 13, color: '#888' }}>{b.sub}</p>
          </div>
        ))}
      </div>
    </>
  );
}
