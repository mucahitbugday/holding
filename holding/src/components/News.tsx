'use client';

import { useState, useEffect } from 'react';
import ScrollReveal from './ScrollReveal';

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
      console.error('Haberler yüklenemedi:', error);
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
                <div className="news-date">
                  <span className="day">{item.day}</span>
                  <span className="month">{item.month}</span>
                </div>
                <div className="news-content">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <a href={item.link || '#'} className="news-link">
                    Devamını Oku →
                  </a>
                </div>
              </article>
            </ScrollReveal>
          ))}
        </div>
        <div className="text-center">
          <ScrollReveal delay={300} direction="up">
            <a href="#haberler" className="btn btn-outline hover-lift">
              Daha Fazla Gör
            </a>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
