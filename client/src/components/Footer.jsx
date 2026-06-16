import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer style={{
      background: '#1a3a5c',
      color: '#fff',
      padding: '32px 24px 16px',
      marginTop: 'auto',
    }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 32 }}>

        {/* Brand */}
        <div>
          <h3 style={{ color: '#f8ad9d', margin: '0 0 8px' }}>ABC الحاوي</h3>
          <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>متجر ألعاب الأطفال الأول في مصر</p>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ color: '#f8ad9d', margin: '0 0 12px' }}>{t('contactUs')}</h4>
          <a href="https://wa.me/201212957890" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            📱 01212957890
          </a>
          <a href="https://wa.me/201270530308" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            📱 01270530308
          </a>
        </div>

        {/* Social */}
        <div>
          <h4 style={{ color: '#f8ad9d', margin: '0 0 12px' }}>{t('followUs')}</h4>
          <a href="https://www.instagram.com/abcalhawi123/#" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            📸 Instagram
          </a>
          <a href="https://www.facebook.com/profile.php?id=61590921087512" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            👍 Facebook
          </a>
          <a href="https://www.tiktok.com/@abcalhawi" target="_blank" rel="noopener noreferrer" style={linkStyle}>
            🎵 TikTok
          </a>
        </div>

        {/* Policy */}
        <div>
          <h4 style={{ color: '#f8ad9d', margin: '0 0 12px' }}>سياسات المتجر</h4>
          <p style={{ fontSize: 13, opacity: 0.8, margin: '0 0 6px' }}>🔄 سياسة الإرجاع: 15 يوم</p>
          <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>🚚 شحن لجميع محافظات مصر</p>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: 24, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: 12, opacity: 0.7 }}>
        {t('rights')} — 2025
      </div>
    </footer>
  );
}

const linkStyle = {
  display: 'block',
  color: '#fff',
  textDecoration: 'none',
  fontSize: 13,
  marginBottom: 6,
  opacity: 0.85,
};
