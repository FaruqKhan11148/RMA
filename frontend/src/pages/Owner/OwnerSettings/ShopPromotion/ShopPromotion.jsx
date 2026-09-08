import './ShopPromotion.css';

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

function ShopPromotion() {
  const navigate = useNavigate();
  const qrRef = useRef(null);

  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShop = async () => {
      try {
        const token = localStorage.getItem('rma_owner_token');

        if (!token) {
          navigate('/owner/login');
          return;
        }

        const response = await fetch(
          'https://rma-backend-bo4a.onrender.com/api/owners/me',
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Unable to load shop details');
        }

        setShop(data.owner || data);
      } catch (error) {
        console.error('Fetch shop details failed:', error);

        setError(error.message || 'Unable to load shop details');
      } finally {
        setLoading(false);
      }
    };

    fetchShop();
  }, [navigate]);

  if (loading) {
    return (
      <div className="shop-promotion-page">
        <div className="shop-promotion-loading">Loading your shop...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shop-promotion-page">
        <div className="shop-promotion-error">
          <h2>Unable to load shop</h2>

          <p>{error}</p>

          <button onClick={() => navigate('/owner/settings/account')}>
            ← Back to Settings
          </button>
        </div>
      </div>
    );
  }

  const shopId = shop?.shopId || '';

  const shopName = shop?.name || shop?.shopName || 'Your Shop';

  /*
    Customer-facing shop URL.
  */
  const shopUrl = `https://rma-rho.vercel.app/shop/${shopId}`;

  /*
    -----------------------------------------
    DOWNLOAD A4 POSTER
    -----------------------------------------
  */

  const handleDownloadPoster = async () => {
    try {
      if (!shopId) {
        return;
      }

      /*
        Load approved RMA poster template.
      */
      const templateResponse = await fetch('/rma-shop-poster-template.png');

      if (!templateResponse.ok) {
        throw new Error('Poster template could not be loaded');
      }

      const templateBlob = await templateResponse.blob();

      const templateDataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onloadend = () => resolve(reader.result);

        reader.onerror = reject;

        reader.readAsDataURL(templateBlob);
      });

      /*
        Generate the REAL QR for this shop.
      */
      const qrDataUrl = await QRCode.toDataURL(shopUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 1000,
      });

      /*
        Create A4 PDF.
      */
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pageWidth = 210;
      const pageHeight = 297;

      /*
        Add approved poster artwork.
      */
      pdf.addImage(templateDataUrl, 'PNG', 0, 0, pageWidth, pageHeight);

      /*
        -----------------------------------------
        REPLACE DEMO QR
        -----------------------------------------
      */

      /*
        These coordinates match the QR area
        in the approved RMA poster.

        IMPORTANT:
        QR was previously too small and
        incorrectly positioned.

        New size:
        66mm × 66mm
      */
      const qrX = 69.5;
      const qrY = 108;
      const qrSize = 70;

      /*
        Cover the COMPLETE demo QR.
      */
      pdf.setFillColor(255, 255, 255);

      pdf.roundedRect(qrX - 2, qrY - 2, qrSize + 4, qrSize + 4, 4, 4, 'F');

      /*
        Green border around REAL QR.
      */
      pdf.setDrawColor(0, 85, 60);

      pdf.setLineWidth(1);

      pdf.roundedRect(qrX - 1, qrY - 1, qrSize + 2, qrSize + 2, 4, 4, 'S');

      /*
        Add REAL QR.
      */
      pdf.addImage(qrDataUrl, 'PNG', qrX, qrY, qrSize, qrSize);

      /*
        -----------------------------------------
        REPLACE DEMO SHOP ID
        -----------------------------------------
      */

      const idX = 151;
      const idY = 141;
      const idWidth = 52;
      const idHeight = 19;

      /*
        Cover SHOP123.
      */
      pdf.setFillColor(232, 245, 226);

      pdf.roundedRect(idX, idY, idWidth, idHeight, 3, 3, 'F');

      /*
        Shop ID label.
      */
      pdf.setTextColor(25, 75, 55);

      pdf.setFont('helvetica', 'bold');

      pdf.setFontSize(9);

      pdf.text('SHOP ID', idX + idWidth / 2, idY + 6, {
        align: 'center',
      });

      /*
        Real Shop ID.
      */
      pdf.setTextColor(10, 50, 38);

      pdf.setFontSize(12);

      pdf.text(shopId, idX + idWidth / 2, idY + 14, {
        align: 'center',
      });

      /*
        -----------------------------------------
        DOWNLOAD
        -----------------------------------------
      */

      pdf.save(`${shopId}-RMA-Shop-Poster.pdf`);
    } catch (error) {
      console.error('Download A4 poster failed:', error);

      alert('Unable to generate the A4 poster. Please try again.');
    }
  };

  /*
    -----------------------------------------
    DOWNLOAD QR
    -----------------------------------------
  */

  const handleDownloadQR = () => {
    const svg = qrRef.current?.querySelector('svg');

    if (!svg) {
      return;
    }

    const serializer = new XMLSerializer();

    const svgString = serializer.serializeToString(svg);

    const blob = new Blob([svgString], {
      type: 'image/svg+xml;charset=utf-8',
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');

    link.href = url;

    link.download = `${shopId}-RMA-QR.svg`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  return (
    <div className="shop-promotion-page">
      <div className="shop-promotion-header">
        <button
          className="shop-promotion-back"
          onClick={() => navigate('/owner/settings/account')}
        >
          ← Settings
        </button>

        <div>
          <h1>Shop QR & Poster</h1>

          <p>Help customers discover and order from your shop.</p>
        </div>
      </div>

      <div className="shop-promotion-container">
        <section className="shop-promotion-intro">
          <span className="shop-promotion-badge">YOUR RMA SHOP</span>

          <h2>Bring your shop online</h2>

          <p>
            Display your RMA QR poster at your shop so customers can scan,
            browse your products and place orders online.
          </p>
        </section>

        <section className="shop-qr-card">
          <div className="shop-qr-info">
            <span className="shop-qr-label">SHOP QR CODE</span>

            <h2>{shopName}</h2>

            <p>Customers can scan this QR code to open your shop directly.</p>
          </div>

          <div className="shop-qr-box" ref={qrRef}>
            {shopId ? (
              <QRCodeSVG value={shopUrl} size={220} level="H" includeMargin />
            ) : (
              <div className="shop-qr-missing">Shop ID unavailable</div>
            )}
          </div>

          <div className="shop-id-box">
            <span>Shop ID</span>

            <strong>{shopId || 'Unavailable'}</strong>
          </div>
        </section>

        <section className="shop-promotion-actions">
          <button
            className="shop-action-button primary"
            disabled={!shopId}
            onClick={handleDownloadQR}
          >
            Download QR
          </button>

          <button
            className="shop-action-button secondary"
            disabled={!shopId}
            onClick={handleDownloadPoster}
          >
            Download A4 Poster PDF
          </button>
        </section>

        <section className="shop-promotion-note">
          <h3>How this works</h3>

          <div className="shop-promotion-steps">
            <div className="promotion-step">
              <span>1</span>

              <div>
                <strong>Download your poster</strong>

                <p>Get a personalized A4 RMA poster for your shop.</p>
              </div>
            </div>

            <div className="promotion-step">
              <span>2</span>

              <div>
                <strong>Print & display it</strong>

                <p>Put the poster where customers can easily see it.</p>
              </div>
            </div>

            <div className="promotion-step">
              <span>3</span>

              <div>
                <strong>Customers scan & order</strong>

                <p>
                  Customers open your shop directly and start ordering online.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ShopPromotion;
