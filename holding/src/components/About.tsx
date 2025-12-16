'use client';

import { useState, useEffect } from 'react';
import ScrollReveal from './ScrollReveal';

interface Content {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  content: string;
  type: string;
}

export default function About() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent();
  }, []);

  const loadContent = async () => {
    try {
      const response = await fetch('/api/content?type=about');
      const data = await response.json();
      if (data.success && data.contents) {
        setContents(data.contents);
      }
    } catch (error) {
      console.error('İçerik yüklenemedi:', error);
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

  const displayContents = contents.length > 0
    ? contents.map((c) => ({
        title: c.title,
        description: c.description || c.content.substring(0, 100),
        icon: 'fas fa-globe',
      }))
    : defaultContents;

  return (
    <section className="about" id="kurumsal">
      <div className="container">
        <div className="section-header">
          <h2>Hakkımızda</h2>
          <p>
            İş geliştirme hiç durmayacak bir süreçtir. İş süreçlerini bütünsel açıdan değerlendirip müşterilerimize entegre çözümler üretiyoruz.
          </p>
        </div>
        <div className="about-grid">
          {displayContents.map((item, index) => (
            <ScrollReveal key={index} delay={index * 100} direction="up">
              <div className="about-card hover-lift">
                <div className="icon">
                  <i className={item.icon}></i>
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
