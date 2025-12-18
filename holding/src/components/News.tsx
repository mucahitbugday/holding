'use client';

import { useState, useEffect } from 'react';
import ScrollReveal from './ScrollReveal';
import { logger } from '@/lib/logger';

interface NewsItem {
  day: string;
  month: string;
  title: string;
  description: string;
  link?: string;
  order: number;
}

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [sectionTitle, setSectionTitle] = useState('Haberler');
  const [sectionDescription, setSectionDescription] = useState('Sektöre dair tüm gelişmeler ve en güncel haberleri bu sayfadan takip edebilirsiniz.');

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      const response = await fetch('/api/homepage');
      const data = await response.json();
      if (data.success && data.settings) {
        const newsSection = data.settings.sections.find((s: any) => s.type === 'news' && s.isActive);
        if (newsSection && newsSection.data) {
          if (newsSection.data.news && newsSection.data.news.length > 0) {
            const sortedNews = [...newsSection.data.news].sort((a: NewsItem, b: NewsItem) => a.order - b.order);
            setNews(sortedNews);
          } else {
            // Default news
            setNews([
              {
                day: '29',
                month: 'Oca',
                title: 'Yeni Proje Başarıyla Tamamlandı',
                description: 'Büyük ölçekli bir projeyi başarıyla tamamladık ve müşterilerimize teslim ettik.',
                link: '#',
                order: 0,
              },
            ]);
          }
          if (newsSection.data.newsTitle) {
            setSectionTitle(newsSection.data.newsTitle);
          }
          if (newsSection.data.newsDescription) {
            setSectionDescription(newsSection.data.newsDescription);
          }
        }
      }
    } catch (error) {
      logger.error('Haberler yüklenemedi:', error);
    }
  };

  return (
    <section className="news" id="haberler">
      <div className="container">
        <div className="section-header">
          <h2>{sectionTitle}</h2>
          <p>{sectionDescription}</p>
        </div>
        <div className="news-grid">
          {news.map((item, index) => (
            <ScrollReveal key={index} delay={index * 100} direction="up">
              <article className="news-card hover-lift">
                <time className="news-date" dateTime={`${item.month}-${item.day}`}>
                  <span className="day" aria-hidden="true">{item.day}</span>
                  <span className="month" aria-hidden="true">{item.month}</span>
                </time>
                <div className="news-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <a href={item.link || '#'} className="news-link" aria-label={`${item.title} - Devamını oku`}>
                    Devamını Oku <span aria-hidden="true">→</span>
                  </a>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
        <div className="text-center">
          <ScrollReveal delay={300} direction="up">
            <a href="#haberler" className="btn btn-outline hover-lift" aria-label="Daha fazla haber görüntüle">
              Daha Fazla Gör
            </a>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
