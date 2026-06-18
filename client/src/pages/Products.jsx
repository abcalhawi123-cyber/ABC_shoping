import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useLang } from '../context/LangContext';
import { getProducts } from '../api';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';

export default function Products() {
  const { t } = useLang();
  const [sp, setSp] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState('newest');
  const q = sp.get('q') || '', category = sp.get('category') || '', page = parseInt(sp.get('page') || '1');

  useEffect(() => {
    setLoading(true);
    getProducts({ q, category, sort, page, limit: 20 })
      .then(r => { setProducts(r.data.data); setPagination(r.data.pagination); })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [q, category, sort, page]);

  const go = p => { const x = {}; if (q) x.q = q; if (category) x.category = category; x.page = p; setSp(x); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  return (
    <>
      <Helmet><title>المنتجات — ABC الحاوي</title></Helmet>
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <h1 style={{ margin: 0, color: '#1a3a5c', fontSize: 22 }}>{q ? `نتائج: "${q}"` : t('products')} {pagination.total > 0 && <span style={{ fontSize: 14, color: '#888' }}>({pagination.total})</span>}</h1>
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ marginInlineStart: 'auto', padding: '7px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }}>
          <option value="newest">الأحدث</option>
          <option value="popular">الأكثر مبيعاً</option>
          <option value="price_asc">السعر: الأقل</option>
          <option value="price_desc">السعر: الأعلى</option>
          <option value="rating">الأعلى تقييماً</option>
        </select>
      </div>
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20 }}>
          {Array(8).fill(0).map((_, i) => <div key={i} style={{ background: '#f5f5f5', borderRadius: 14, aspectRatio: '0.8' }} />)}
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}><p style={{ fontSize: 48 }}>🔍</p><p>لم يتم العثور على منتجات</p></div>
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
