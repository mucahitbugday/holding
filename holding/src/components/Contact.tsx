'use client';

import { FormEvent } from 'react';

export default function Contact() {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const emailInput = form.querySelector('input[type="email"]') as HTMLInputElement;
    if (emailInput) {
      alert(`E-bülten kaydınız alındı! Teşekkürler: ${emailInput.value}`);
      form.reset();
    }
  };

  return (
    <section className="contact" id="iletisim">
      <div className="contact-map-background">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.1234567890123!2d29.0123456!3d41.0123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDHCsDAwJzQ0LjQiTiAyOcKwMDAnNDQuNCJF!5e0!3m2!1str!2str!4v1234567890123!5m2!1str!2str"
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
          href="https://www.google.com/maps/search/?api=1&query=Küçükçamlıca+Mahallesi+Libadiye+Caddesi+Ümit+Sokak+No+13+A+Bulgurlu+Üsküdar+İstanbul"
          target="_blank"
          rel="noopener noreferrer"
          className="map-button"
        >
          <span>🗺️</span> Google Haritalar&apos;da Aç
        </a>
        <div className="contact-content">
          <div className="contact-info">
            <h2>İletişim</h2>
            <div className="contact-item">
              <strong>Adres:</strong>
              <p>
                Küçükçamlıca Mahallesi
                <br />
                Libadiye Caddesi Ümit Sokak
                <br />
                No: 13 A Bulgurlu Üsküdar / İstanbul
              </p>
            </div>
            <div className="contact-item">
              <strong>Telefon:</strong>
              <p>+90 0850 466 04 77</p>
            </div>
            <div className="contact-item">
              <strong>E-Posta:</strong>
              <p>info@holding.com.tr</p>
            </div>
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
