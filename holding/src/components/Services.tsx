'use client';

import { useState, useEffect } from 'react';
import ScrollReveal from './ScrollReveal';
import { logger } from '@/lib/logger';

interface ServiceItem {
  icon: string;
  title: string;
  description: string;
  order: number;
}

export default function Services() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [sectionTitle, setSectionTitle] = useState('Hizmetlerimiz');
  const [sectionDescription, setSectionDescription] = useState('Geniş hizmet yelpazemizle ihtiyaçlarınıza çözüm üretiyoruz');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const response = await fetch('/api/homepage');
      const data = await response.json();
      if (data.success && data.settings) {
        const servicesSection = data.settings.sections.find((s: any) => s.type === 'services' && s.isActive);
        if (servicesSection && servicesSection.data) {
          if (servicesSection.data.services && servicesSection.data.services.length > 0) {
            const sortedServices = [...servicesSection.data.services].sort((a: ServiceItem, b: ServiceItem) => a.order - b.order);
            setServices(sortedServices);
          }
          if (servicesSection.data.servicesTitle) {
            setSectionTitle(servicesSection.data.servicesTitle);
          }
          if (servicesSection.data.servicesDescription) {
            setSectionDescription(servicesSection.data.servicesDescription);
          }
        }
      }
    } catch (error) {
      logger.error('Hizmetler yüklenemedi:', error);
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
  ];

  const displayServices = services.length > 0 ? services : defaultServices;

  return (
    <section className="services" id="hizmetler">
      <div className="container">
        <div className="section-header">
          <h2>{sectionTitle}</h2>
          <p>{sectionDescription}</p>
        </div>
        <div className="services-grid">
          {displayServices.map((service, index) => (
            <ScrollReveal key={index} delay={index * 100} direction="up">
              <div className="service-card hover-lift">
                <div className="service-icon" aria-hidden="true">
                  <i className={service.icon} aria-hidden="true"></i>
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
