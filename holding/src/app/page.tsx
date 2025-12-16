'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import HRPolicy from '@/components/HRPolicy';
import News from '@/components/News';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import SmoothScroll from '@/components/SmoothScroll';

interface HomePageSection {
  type: 'hero' | 'about' | 'services' | 'hrpolicy' | 'news' | 'contact';
  order: number;
  isActive: boolean;
  data: any;
}

export default function Home() {
  const [sections, setSections] = useState<HomePageSection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHomePageSettings();
  }, []);

  const loadHomePageSettings = async () => {
    try {
      const response = await fetch('/api/homepage');
      const data = await response.json();
      if (data.success && data.settings) {
        // Aktif sectionları sıraya göre sırala
        const activeSections = data.settings.sections
          .filter((s: HomePageSection) => s.isActive)
          .sort((a: HomePageSection, b: HomePageSection) => a.order - b.order);
        setSections(activeSections);
      } else {
        // Varsayılan sectionlar
        setSections([
          { type: 'hero', order: 0, isActive: true, data: {} },
          { type: 'about', order: 1, isActive: true, data: {} },
          { type: 'services', order: 2, isActive: true, data: {} },
          { type: 'hrpolicy', order: 3, isActive: true, data: {} },
          { type: 'news', order: 4, isActive: true, data: {} },
          { type: 'contact', order: 5, isActive: true, data: {} },
        ]);
      }
    } catch (error) {
      console.error('Anasayfa ayarları yüklenemedi:', error);
      // Varsayılan sectionlar
      setSections([
        { type: 'hero', order: 0, isActive: true, data: {} },
        { type: 'about', order: 1, isActive: true, data: {} },
        { type: 'services', order: 2, isActive: true, data: {} },
        { type: 'hrpolicy', order: 3, isActive: true, data: {} },
        { type: 'news', order: 4, isActive: true, data: {} },
        { type: 'contact', order: 5, isActive: true, data: {} },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderSection = (section: HomePageSection) => {
    switch (section.type) {
      case 'hero':
        return <Hero key="hero" slides={section.data.slides} />;
      case 'about':
        return <About key="about" data={section.data} />;
      case 'services':
        return <Services key="services" />;
      case 'hrpolicy':
        return <HRPolicy key="hrpolicy" />;
      case 'news':
        return <News key="news" />;
      case 'contact':
        return <Contact key="contact" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <>
        <SmoothScroll />
        <Header />
        <main>
          <div style={{ padding: '4rem', textAlign: 'center' }}>Yükleniyor...</div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <SmoothScroll />
      <Header />
      <main>
        {sections.map((section) => renderSection(section))}
      </main>
      <Footer />
    </>
  );
}
