'use client';

import ScrollReveal from './ScrollReveal';

export default function News() {
  const news = [
    {
      day: '29',
      month: 'Oca',
      title: 'Yeni Proje Başarıyla Tamamlandı',
      description: 'Büyük ölçekli bir projeyi başarıyla tamamladık ve müşterilerimize teslim ettik.',
    },
    {
      day: '06',
      month: 'Şub',
      title: 'Yeni Ofis Açılışı',
      description: 'Büyüyen iş hacmimiz nedeniyle yeni ofisimizi açtık.',
    },
    {
      day: '25',
      month: 'Şub',
      title: 'Sertifika ve Yetki Belgesi',
      description: 'Yeni sertifika ve yetki belgelerimizi aldık.',
    },
  ];

  return (
    <section className="news" id="haberler">
      <div className="container">
        <div className="section-header">
          <h2>Haberler</h2>
          <p>Sektöre dair tüm gelişmeler ve en güncel haberleri bu sayfadan takip edebilirsiniz.</p>
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
                  <a href="#" className="news-link">
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
