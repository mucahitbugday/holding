'use client';

import { useState, useEffect } from 'react';
import ScrollReveal from './ScrollReveal';

interface Service {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  content: string;
  type: string;
}

export default function Services() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await fetch('/api/content?type=service');
      const data = await response.json();
      if (data.success && data.contents) {
        setServices(data.contents);
      }
    } catch (error) {
      console.error('Hizmetler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  // Varsayılan hizmetler
  const defaultServices = [
    {
      icon: 'fas fa-laptop-code',
      title: 'Teknoloji',
      description: 'Modern teknoloji çözümleri ile işletmenizi geleceğe taşıyoruz.',
    },
    {
      icon: 'fas fa-building',
      title: 'Entegre Tesis Yönetimi',
      description: 'Tesislerinizin tüm yönetim ihtiyaçlarını tek çatı altında topluyoruz.',
    },
    {
      icon: 'fas fa-shield-alt',
      title: 'Güvenlik',
      description: 'Profesyonel güvenlik hizmetleri ile tesislerinizi koruyoruz.',
    },
    {
      icon: 'fas fa-broom',
      title: 'Temizlik',
      description: 'Hijyen standartlarına uygun temizlik hizmetleri sunuyoruz.',
    },
    {
      icon: 'fas fa-tools',
      title: 'Teknik Hizmetler',
      description: 'Teknik ve mobil teknik hizmetler ile yanınızdayız.',
    },
    {
      icon: 'fas fa-graduation-cap',
      title: 'Danışmanlık & Eğitim',
      description: 'Danışmanlık, eğitim ve denetim hizmetleri veriyoruz.',
    },
  ];

  const iconMap: { [key: string]: string } = {
    teknoloji: 'fas fa-laptop-code',
    tesis: 'fas fa-building',
    guvenlik: 'fas fa-shield-alt',
    temizlik: 'fas fa-broom',
    teknik: 'fas fa-tools',
    danismanlik: 'fas fa-graduation-cap',
  };

  const displayServices = services.length > 0
    ? services.map((s) => {
        const slugLower = s.slug.toLowerCase();
        const icon = Object.keys(iconMap).find((key) => slugLower.includes(key))
          ? iconMap[Object.keys(iconMap).find((key) => slugLower.includes(key))!]
          : 'fas fa-star';
        return {
          icon,
          title: s.title,
          description: s.description || s.content.substring(0, 100),
        };
      })
    : defaultServices;

  return (
    <section className="services" id="hizmetler">
      <div className="container">
        <div className="section-header">
          <h2>Hizmetlerimiz</h2>
          <p>Geniş hizmet yelpazemizle ihtiyaçlarınıza çözüm üretiyoruz</p>
        </div>
        <div className="services-grid">
          {displayServices.map((service, index) => (
            <ScrollReveal key={index} delay={index * 100} direction="up">
              <div className="service-card hover-lift">
                <div className="service-icon">
                  <i className={service.icon}></i>
                </div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
