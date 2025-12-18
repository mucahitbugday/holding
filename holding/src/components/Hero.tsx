'use client';

import { useState, useEffect } from 'react';
import { logger } from '@/lib/logger';

interface HeroSlide {
  title: string;
  description: string;
  link: string;
  linkText: string;
  image: string;
  order: number;
}

export default function Hero({ slides: propSlides }: { slides?: HeroSlide[] }) {
  const [slides, setSlides] = useState<HeroSlide[]>(propSlides || []);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState<boolean[]>([]);

  useEffect(() => {
    // Eğer prop'tan slides gelmediyse API'den çek
    if (!propSlides || propSlides.length === 0) {
      loadHeroData();
    } else {
      setSlides(propSlides);
    }
  }, [propSlides]);

  const loadHeroData = async () => {
    try {
      const response = await fetch('/api/homepage');
      const data = await response.json();
      if (data.success && data.settings) {
        const heroSection = data.settings.sections.find((s: any) => s.type === 'hero' && s.isActive);
        if (heroSection && heroSection.data.slides) {
          const sortedSlides = [...heroSection.data.slides].sort((a: HeroSlide, b: HeroSlide) => a.order - b.order);
          setSlides(sortedSlides);
        }
      }
    } catch (error) {
      logger.error('Hero verileri yüklenemedi:', error);
      // Varsayılan slides
      setSlides([
        {
          title: 'Dünya Standartlarında Hizmet',
          description: 'Sektörümüzle ilgili dünyadaki gelişmeleri takip ediyor ve işimizi sürekli olarak geliştiriyoruz.',
          link: '#hizmetler',
          linkText: 'Hizmetlerimiz',
          image: '/images/slide1.jpg',
          order: 0,
        },
      ]);
    }
  };

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

  if (slides.length === 0) {
    return null;
  }

  return (
    <section className="hero" aria-label="Ana slider">
      <div className="hero-slider" role="region" aria-label="Hero slider">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={
              imagesLoaded[index]
                ? { backgroundImage: `url(${slide.image})` }
                : { backgroundImage: 'none' }
            }
            data-no-image={!imagesLoaded[index] ? 'true' : undefined}
            role="tabpanel"
            aria-hidden={index !== currentSlide}
            aria-labelledby={`slide-tab-${index}`}
          >
            <div className="hero-content fade-in">
              <h2 className="gradient-text" style={{ 
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.9) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>{slide.title}</h2>
              <p>{slide.description}</p>
              <a href={slide.link} className="btn btn-primary hover-lift" aria-label={`${slide.linkText} - ${slide.title}`}>
                {slide.linkText}
              </a>
            </div>
          </div>
        ))}
      </div>
      <div className="hero-nav" aria-label="Slider kontrolleri">
        <button 
          className="hero-prev" 
          onClick={prevSlide} 
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              prevSlide();
            }
          }}
          aria-label="Önceki slide"
          type="button"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <button 
          className="hero-next" 
          onClick={nextSlide} 
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              nextSlide();
            }
          }}
          aria-label="Sonraki slide"
          type="button"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>
      <div className="hero-dots" role="tablist" aria-label="Slide navigasyonu">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            id={`slide-tab-${index}`}
            className={`dot ${index === currentSlide ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goToSlide(index);
              }
            }}
            aria-label={`Slide ${index + 1}'e git`}
            aria-current={index === currentSlide ? 'true' : 'false'}
            role="tab"
            aria-selected={index === currentSlide}
            tabIndex={index === currentSlide ? 0 : -1}
          ></button>
        ))}
      </div>
    </section>
  );
}
