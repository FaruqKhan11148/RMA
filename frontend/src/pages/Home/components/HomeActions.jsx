import { QrCode } from 'lucide-react';
import { useLanguage } from '../../../context/LanguageContext';

function HomeActions({ onScanQr, onFindShop }) {
  const { t } = useLanguage();

  return (
    <section className="home_actions">
      {/* SCAN QR */}

      <button className="qr_action" onClick={onScanQr}>
        <div className="action_icon">
          <QrCode className="qr_icon_pattern" />
        </div>

        <div className="action_content">
          <span className="action_badge">{t.home.scanQrBadge}</span>

          <h2>{t.home.scanQr}</h2>

          <p>{t.home.scanQrDescription}</p>
        </div>

        <span className="action_arrow">→</span>
      </button>

      {/* FIND SHOP */}

      <button className="find_action" onClick={onFindShop}>
        <div className="find_icon">
          <span>⌕</span>
        </div>

        <div className="find_content">
          <span className="find_badge">{t.home.findShopBadge}</span>

          <span className="find_title">{t.home.findShop}</span>

          <span className="find_description">{t.home.findShopDescription}</span>
        </div>

        <span className="find_arrow">→</span>
      </button>
    </section>
  );
}

export default HomeActions;
