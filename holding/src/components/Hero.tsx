'use client';

import { useState, useEffect } from 'react';

const slides = [
  {
    id: 1,
    title: 'Dünya Standartlarında Hizmet',
    description: 'Sektörümüzle ilgili dünyadaki gelişmeleri takip ediyor ve işimizi sürekli olarak geliştiriyoruz.',
    link: '#hizmetler',
    linkText: 'Hizmetlerimiz',
    image: '/images/slide1.jpg',
  },
  {
    id: 2,
    title: 'İyi Bir Tesis Yönetim Şirketini Nasıl Seçersiniz?',
    description: 'Deneyimli ekibimiz ve modern çözümlerimizle yanınızdayız.',
    link: '#hizmetler',
    linkText: 'Keşfet',
    image: '/images/slide2.jpg',
  },
  {
    id: 3,
    title: 'Güvenlik Önlemleri',
    description: 'En yüksek güvenlik standartlarıyla hizmet veriyoruz.',
    link: '#guvenlik',
    linkText: 'Detaylar',
    image: '/images/slide3.jpg',
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);

  useEffect(() => {
    // Preload images
    const loadImages = async () => {
      const loaded: boolean[] = [];
      for (const slide of slides) {
        const img = new Image();
        await new Promise((resolve) => {
          img.onload = () => {
            loaded.push(true);
            resolve(true);
          };
          img.onerror = () => {
            loaded.push(false);
            resolve(false);
          };
          img.src = slide.image;
        });
      }
      setImagesLoaded(loaded);
    };
    loadImages();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
    <section className="hero">
      <div className="hero-slider">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={
              imagesLoaded[index]
                ? { backgroundImage: `url(${slide.image})` }
                : { backgroundImage: 'none' }
            }
            data-no-image={!imagesLoaded[index] ? 'true' : undefined}
          >
            <div className="hero-content">
              <h2>{slide.title}</h2>
              <p>{slide.description}</p>
              <a href={slide.link} className="btn btn-primary">
                {slide.linkText}
              </a>
            </div>
          </div>
        ))}
      </div>
      <div className="hero-nav">
        <button className="hero-prev" onClick={prevSlide} aria-label="Önceki slide">
          ‹
        </button>
        <button className="hero-next" onClick={nextSlide} aria-label="Sonraki slide">
          ›
        </button>
      </div>
      <div className="hero-dots">
        {slides.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            aria-label={`Slide ${index + 1}`}
          ></span>
        ))}
      </div>
    </section>
  );
}
