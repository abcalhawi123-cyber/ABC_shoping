import { useLang } from '../context/LangContext';

export default function Footer() {
  const { t, lang } = useLang();
  return (
    <footer style={{ background: '#1a3a5c', color: '#fff', padding: '36px 20px 16px', marginTop: 'auto' }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: 28,
        marginBottom: 24,
      }}>
        {/* Brand */}
        <div>
          <h3 style={{ color: '#f8ad9d', margin: '0 0 8px', fontSize: 18 }}>
            ABC {lang === 'ar' ? 'الحاوي' : 'Al-Hawi'}
          </h3>
          <p style={{ fontSize: 13, opacity: 0.8, margin: 0, lineHeight: 1.6 }}>
            {lang === 'ar' ? 'متجر ألعاب الأطفال الأول في مصر' : "Egypt's #1 children's toy store"}
          </p>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ color: '#f8ad9d', margin: '0 0 12px', fontSize: 15 }}>{t('contactUs')}</h4>
          <a href="https://wa.me/201212957890" target="_blank" rel="noopener noreferrer" style={L}>
            📱 01212957890
          </a>
          <a href="https://wa.me/201270530308" target="_blank" rel="noopener noreferrer" style={L}>
            📱 01270530308
          </a>
        </div>

        {/* Social */}
        <div>
          <h4 style={{ color: '#f8ad9d', margin: '0 0 12px', fontSize: 15 }}>{t('followUs')}</h4>
          <a href="https://www.instagram.com/abcalhawi123/#" target="_blank" rel="noopener noreferrer" style={L}>
            📸 Instagram
          </a>
          <a href="https://www.facebook.com/profile.php?id=61590921087512" target="_blank" rel="noopener noreferrer" style={L}>
            👍 Facebook
          </a>
          <a href="https://www.tiktok.com/@abcalhawi" target="_blank" rel="noopener noreferrer" style={L}>
            🎵 TikTok
          </a>
        </div>

        {/* Policies */}
        <div>
          <h4 style={{ color: '#f8ad9d', margin: '0 0 12px', fontSize: 15 }}>{t('storePolicies')}</h4>
          <p style={{ fontSize: 13, opacity: 0.8, margin: '0 0 6px' }}>🔄 {t('returnPolicy15')}</p>
          <p style={{ fontSize: 13, opacity: 0.8, margin: 0 }}>🚚 {t('shippingAllGov')}</p>
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        paddingTop: 16,
        borderTop: '1px solid rgba(255,255,255,0.1)',
        fontSize: 12,
        opacity: 0.7,
      }}>
        {t('rights')} — 2025
      </div>
    </footer>
  );
}

const L = {
  display: 'block',
  color: '#fff',
  textDecoration: 'none',
  fontSize: 13,
  marginBottom: 8,
  opacity: 0.85,
  transition: 'opacity 0.2s',
};
