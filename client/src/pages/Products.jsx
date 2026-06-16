import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

export default function Products() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');

  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await getProducts({ q, category, sort, page, limit: 20 });
        setProducts(data.data);
        setPagination(data.pagination);
      } catch {
        setProducts([]);
      }
      setLoading(false);
    };
    fetch();
  }, [q, category, sort, page]);

  const handlePage = (p) => {
    const params = {};
    if (q) params.q = q;
    if (category) params.category = category;
    if (sort !== 'newest') params.sort = sort;
    params.page = p;
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Helmet>
        <title>المنتجات — ABC الحاوي</title>
        <meta name="description" content="تسوق ألعاب الأطفال، الدباديب، الميداليات، الشنط وأكثر في ABC الحاوي" />
      </Helmet>

      {/* Filters bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <h1 style={{ margin: 0, color: '#1a3a5c', fontSize: 22 }}>
          {q ? `نتائج: "${q}"` : t('products')}
          {pagination.total > 0 && <span style={{ fontSize: 14, color: '#888', marginRight: 8 }}>({pagination.total})</span>}
        </h1>
        <div style={{ marginInlineStart: 'auto', display: 'flex', gap: 10 }}>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            style={{ padding: '7px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }}
          >
            <option value="newest">الأحدث</option>
            <option value="popular">الأكثر مبيعاً</option>
            <option value="price_asc">السعر: الأقل أولاً</option>
            <option value="price_desc">السعر: الأعلى أولاً</option>
            <option value="rating">الأعلى تقييماً</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
          {Array(8).fill(0).map((_, i) => (
            <div key={i} style={{ background: '#f5f5f5', borderRadius: 14, aspectRatio: '0.8', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>
          <p style={{ fontSize: 48 }}>🔍</p>
          <p>لم يتم العثور على منتجات</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 20 }}>
            {products.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={handlePage} />
        </>
      )}
    </>
  );
}
