export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;
  const items = [];

  for (let i = 1; i <= pages; i++) {
    if (i === 1 || i === pages || Math.abs(i - page) <= 1) {
      items.push(i);
    } else if (items[items.length - 1] !== '...') {
      items.push('...');
    }
  }

  return (
    <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 32 }}>
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        style={btnStyle(false)}
      >
        ‹
      </button>
      {items.map((item, idx) =>
        item === '...' ? (
          <span key={idx} style={{ padding: '6px 4px', color: '#888' }}>…</span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            style={btnStyle(item === page)}
          >
            {item}
          </button>
        )
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
        style={btnStyle(false)}
      >
        ›
      </button>
    </div>
  );
}

const btnStyle = (active) => ({
  padding: '6px 12px',
  border: active ? 'none' : '1px solid #ddd',
  borderRadius: 6,
  background: active ? '#1a3a5c' : '#fff',
  color: active ? '#fff' : '#333',
  cursor: active ? 'default' : 'pointer',
  fontWeight: active ? 700 : 400,
  minWidth: 36,
});
