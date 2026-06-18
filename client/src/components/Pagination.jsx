export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 32 }}>
      <button onClick={() => onPageChange(page - 1)} disabled={page <= 1} style={btn(false)}>‹</button>
      {Array.from({ length: pages }, (_, i) => i + 1).map(i => (
        <button key={i} onClick={() => onPageChange(i)} style={btn(i === page)}>{i}</button>
      ))}
      <button onClick={() => onPageChange(page + 1)} disabled={page >= pages} style={btn(false)}>›</button>
    </div>
  );
}
const btn = a => ({ padding: '6px 12px', border: a ? 'none' : '1px solid #ddd', borderRadius: 6, background: a ? '#1a3a5c' : '#fff', color: a ? '#fff' : '#333', cursor: a ? 'default' : 'pointer', fontWeight: a ? 700 : 400, minWidth: 36 });
