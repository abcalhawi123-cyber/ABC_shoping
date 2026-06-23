import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLang } from '../context/LangContext';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

const SORT_OPTIONS = {
  ar: [
    { v: 'newest', l: 'الأحدث' },
    { v: 'popular', l: 'الأكثر مبيعاً' },
    { v: 'price_asc', l: 'السعر: الأقل' },
    { v: 'price_desc', l: 'السعر: الأعلى' },
    { v: 'rating', l: 'الأعلى تقييماً' },
  ],
  en: [
    { v: 'newest', l: 'Newest' },
    { v: 'popular', l: 'Best Selling' },
    { v: 'price_asc', l: 'Price: Low to High' },
    { v: 'price_desc', l: 'Price: High to Low' },
    { v: 'rating', l: 'Top Rated' },
  ],
};

export default function Products() {
  const { t, lang } = useLang();
  const [sp, setSp] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');

  const q = sp.get('q') || '';
  const category = sp.get('category') || '';
  const page = parseInt(sp.get('page') || '1');

  useEffect(() => {
    setLoading(true);
    getProducts({ q, category, sort, page, limit: 20 })
      .then(r => { setProducts(r.data.data); setPagination(r.data.pagination); })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [q, category, sort, page]);

  const go = p => {
    const x = {};
    if (q) x.q = q;
    if (category) x.category = category;
    if (sort !== 'newest') x.sort = sort;
    x.page = p;
    setSp(x);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sortOptions = SORT_OPTIONS[lang] || SORT_OPTIONS.ar;

  return (
    <>
      <Helmet>
        <title>{t('products')} — ABC {lang === 'ar' ? 'الحاوي' : 'Al-Hawi'}</title>
      </Helmet>

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <h1 style={{ margin: 0, color: '#1a3a5c', fontSize: 22 }}>
          {q ? `${lang === 'ar' ? 'نتائج:' : 'Results:'} "${q}"` : t('products')}
          {pagination.total > 0 && (
            <span style={{ fontSize: 14, color: '#888', marginInlineStart: 8 }}>({pagination.total})</span>
          )}
        </h1>

        {/* Category tag */}
        {category && (
          <span style={{ padding: '5px 12px', background: '#f8ad9d', color: '#1a3a5c', borderRadius: 16, fontSize: 13, fontWeight: 600 }}>
            {category}
          </span>
        )}

        <select
          value={sort}
          onChange={e => setSort(e.target.value)}
          style={{ marginInlineStart: 'auto', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, background: '#fff', cursor: 'pointer' }}
        >
          {sortOptions.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
          {Array(8).fill(0).map((_, i) => (
            <div key={i} style={{ background: '#f5f5f5', borderRadius: 14, aspectRatio: '0.8', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
          <p style={{ fontSize: 48 }}>🔍</p>
          <p style={{ fontSize: 16 }}>
            {lang === 'ar' ? 'لم يتم العثور على منتجات' : 'No products found'}
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
            {products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={go} />
        </>
      )}
    </>
  );
}
