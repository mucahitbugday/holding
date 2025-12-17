'use client';

import { FormEvent, useState, useEffect } from 'react';

interface Settings {
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  googleMapsLink?: string;
}

export default function Contact() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [sectionTitle, setSectionTitle] = useState('İletişim');
  const [sectionDescription, setSectionDescription] = useState('');

  useEffect(() => {
    loadSettings();
    loadContactSection();
  }, []);

  const loadContactSection = async () => {
    try {
      const response = await fetch('/api/homepage');
      const data = await response.json();
      if (data.success && data.settings) {
        const contactSection = data.settings.sections.find((s: any) => s.type === 'contact' && s.isActive);
        if (contactSection && contactSection.data) {
          if (contactSection.data.contactTitle) {
            setSectionTitle(contactSection.data.contactTitle);
          }
          if (contactSection.data.contactDescription) {
            setSectionDescription(contactSection.data.contactDescription);
          }
        }
      }
    } catch (error) {
      console.error('Contact section verileri yüklenemedi:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('Ayarlar yüklenemedi:', error);
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
    if (emailInput) {
      alert(`E-bülten kaydınız alındı! Teşekkürler: ${emailInput.value}`);
      form.reset();
    }
  };

  const companyAddress = settings?.companyAddress || 'Küçükçamlıca Mahallesi\nLibadiye Caddesi Ümit Sokak\nNo: 13 A Bulgurlu Üsküdar / İstanbul';
  const companyPhone = settings?.companyPhone || '+90 0850 466 04 77';
  const companyEmail = settings?.companyEmail || 'info@holding.com.tr';
  const googleMapsLink = settings?.googleMapsLink || 'https://www.google.com/maps/search/?api=1&query=Küçükçamlıca+Mahallesi+Libadiye+Caddesi+Ümit+Sokak+No+13+A+Bulgurlu+Üsküdar+İstanbul';
  
  // Google Maps embed URL oluştur
  const getEmbedUrl = (link: string) => {
    if (link.includes('/embed')) {
      return link;
    }
    // Eğer search link ise, embed formatına çevir
    const queryMatch = link.match(/query=([^&]+)/);
    if (queryMatch) {
      const query = encodeURIComponent(queryMatch[1]);
      return `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.1234567890123!2d29.0123456!3d41.0123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDAwJzQ0LjQiTiAyOcKwMDAnNDQuNCJF!5e0!3m2!1str!2str!4v1234567890123!5m2!1str!2str&q=${query}`;
    }
    return 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.1234567890123!2d29.0123456!3d41.0123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDAwJzQ0LjQiTiAyOcKwMDAnNDQuNCJF!5e0!3m2!1str!2str!4v1234567890123!5m2!1str!2str';
  };

  return (
    <section className="contact" id="iletisim">
      <div className="contact-map-background">
        <iframe
          src={getEmbedUrl(googleMapsLink)}
          width="100%"
          height="100%"
          style={{ border: 0, filter: 'grayscale(20%) opacity(0.3)' }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Harita"
        ></iframe>
      </div>
      <div className="container">
        <a
          href={googleMapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="map-button"
        >
          <span>🗺️</span> Google Haritalar&apos;da Aç
        </a>
        <div className="contact-content">
          <div className="contact-info">
            {sectionTitle && <h2>{sectionTitle}</h2>}
            {sectionDescription && <p style={{ marginBottom: '1rem', color: '#666' }}>{sectionDescription}</p>}
            {companyAddress && (
              <div className="contact-item">
                <strong>Adres:</strong>
                <p style={{ whiteSpace: 'pre-line' }}>{companyAddress}</p>
              </div>
            )}
            {companyPhone && (
              <div className="contact-item">
                <strong>Telefon:</strong>
                <p><a href={`tel:${companyPhone.replace(/\s/g, '')}`} style={{ color: 'inherit', textDecoration: 'none' }}>{companyPhone}</a></p>
              </div>
            )}
            {companyEmail && (
              <div className="contact-item">
                <strong>E-Posta:</strong>
                <p><a href={`mailto:${companyEmail}`} style={{ color: 'inherit', textDecoration: 'none' }}>{companyEmail}</a></p>
              </div>
            )}
          </div>
          <div className="contact-form">
            <h3>E-Bültene Kayıt Ol</h3>
            <form id="newsletterForm" onSubmit={handleSubmit}>
              <input type="email" placeholder="E-posta adresiniz" required />
              <button type="submit" className="btn btn-primary">
                Gönder
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
