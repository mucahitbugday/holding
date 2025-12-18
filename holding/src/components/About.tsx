'use client';

import { useState, useEffect } from 'react';
import ScrollReveal from './ScrollReveal';
import { logger } from '@/lib/logger';

interface Content {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  content: string;
  type: string;
}

interface AboutData {
  title?: string;
  description?: string;
  items?: Array<{
    title: string;
    description: string;
    icon?: string;
    order: number;
  }>;
}

export default function About({ data: propData }: { data?: AboutData }) {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [aboutData, setAboutData] = useState<AboutData | null>(propData || null);

  useEffect(() => {
    if (propData) {
      setAboutData(propData);
      setLoading(false);
    } else {
      loadContent();
    }
  }, [propData]);

  const loadContent = async () => {
    try {
      // Önce homepage settings'den about data'yı çek
      const homepageResponse = await fetch('/api/homepage');
      const homepageData = await homepageResponse.json();
      if (homepageData.success && homepageData.settings) {
        const aboutSection = homepageData.settings.sections.find((s: any) => s.type === 'about' && s.isActive);
        if (aboutSection && aboutSection.data) {
          setAboutData(aboutSection.data);
          setLoading(false);
          return;
        }
      }

      // Eğer homepage'de yoksa content API'den çek
      const response = await fetch('/api/content?type=about');
      const data = await response.json();
      if (data.success && data.contents) {
        setContents(data.contents);
      }
    } catch (error) {
      logger.error('İçerik yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  // Varsayılan içerik
  const defaultContents = [
    {
      title: 'Dünya Standartlarında',
      description: 'Sektörümüzle ilgili dünyadaki gelişmeleri takip ediyor ve işimizi sürekli olarak geliştiriyoruz.',
      icon: 'fas fa-globe',
    },
    {
      title: 'Entegre Çözümler',
      description: 'İş süreçlerini bütünsel açıdan değerlendirip müşterilerimize entegre çözümler üretiyoruz.',
      icon: 'fas fa-briefcase',
    },
    {
      title: 'Sürekli Gelişim',
      description: 'İş geliştirme hiç durmayacak bir süreçtir. Her zaman daha iyisini hedefliyoruz.',
      icon: 'fas fa-chart-line',
    },
  ];

  // About data'dan items varsa onları kullan, yoksa contents'ten veya default'tan
  let displayContents;
  if (aboutData && aboutData.items && aboutData.items.length > 0) {
    displayContents = [...aboutData.items].sort((a, b) => a.order - b.order).map(item => ({
      title: item.title,
      description: item.description,
      icon: item.icon || 'fas fa-globe',
    }));
  } else if (contents.length > 0) {
    displayContents = contents.map((c) => ({
      title: c.title,
      description: c.description || c.content.substring(0, 100),
      icon: 'fas fa-globe',
    }));
  } else {
    displayContents = defaultContents;
  }

  const sectionTitle = aboutData?.title || 'Hakkımızda';
  const sectionDescription = aboutData?.description || 'İş geliştirme hiç durmayacak bir süreçtir. İş süreçlerini bütünsel açıdan değerlendirip müşterilerimize entegre çözümler üretiyoruz.';

  return (
    <section className="about" id="kurumsal">
      <div className="container">
        <div className="section-header">
          <h2>{sectionTitle}</h2>
          <p>{sectionDescription}</p>
        </div>
        <div className="about-grid">
          {displayContents.map((item, index) => (
            <ScrollReveal key={index} delay={index * 100} direction="up">
              <div className="about-card hover-lift">
                <div className="icon" aria-hidden="true">
                  <i className={item.icon} aria-hidden="true"></i>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
