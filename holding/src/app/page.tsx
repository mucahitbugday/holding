'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Services from '@/components/Services';
import HRPolicy from '@/components/HRPolicy';
import News from '@/components/News';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';
import SmoothScroll from '@/components/SmoothScroll';
import StructuredData from '@/components/StructuredData';
import PageLoader from '@/components/PageLoader';
import { logger } from '@/lib/logger';

// Dynamic imports for non-critical components
const DynamicNews = dynamic(() => import('@/components/News'), {
  loading: () => <div style={{ minHeight: '400px' }} aria-busy="true" aria-label="Haberler yükleniyor" />,
  ssr: true,
});

const DynamicContact = dynamic(() => import('@/components/Contact'), {
  loading: () => <div style={{ minHeight: '400px' }} aria-busy="true" aria-label="İletişim yükleniyor" />,
  ssr: true,
});

interface HomePageSection {
  type: 'hero' | 'about' | 'services' | 'hrpolicy' | 'news' | 'contact';
  order: number;
  isActive: boolean;
  data: any;
}

export default function Home() {
  const [sections, setSections] = useState<HomePageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    loadHomePageSettings();
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      logger.error('Ayarlar yüklenemedi:', error);
    }
  };

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
      logger.error('Anasayfa ayarları yüklenemedi:', error);
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
        return <DynamicNews key="news" />;
      case 'contact':
        return <DynamicContact key="contact" />;
      default:
        return null;
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <>
      <StructuredData type="organization" data={settings} id="org" />
      <StructuredData type="website" data={settings} id="website" />
      <SmoothScroll />
      <Header />
      <main id="main-content" role="main" aria-label="Ana içerik">
        {sections.map((section) => renderSection(section))}
      </main>
      <Footer />
    </>
  );
}
