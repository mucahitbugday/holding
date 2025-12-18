'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { logger } from '@/lib/logger';

interface HRPolicyLink {
  text: string;
  href: string;
  order: number;
}

export default function HRPolicy() {
  const [title, setTitle] = useState('İK Politikamız');
  const [subtitle, setSubtitle] = useState('İnsan Odaklı Yaklaşım');
  const [description, setDescription] = useState('İnsana değer veriyoruz. Yaptığımız iş ne olursa olsun merkezinde insan var. Bu bilinçle insan ve çözüm odaklı bir yaklaşım benimsiyoruz.');
  const [links, setLinks] = useState<HRPolicyLink[]>([]);
  const [image, setImage] = useState('');

  useEffect(() => {
    loadHRPolicy();
  }, []);

  const loadHRPolicy = async () => {
    try {
      const response = await fetch('/api/homepage');
      const data = await response.json();
      if (data.success && data.settings) {
        const hrSection = data.settings.sections.find((s: any) => s.type === 'hrpolicy' && s.isActive);
        if (hrSection && hrSection.data) {
          if (hrSection.data.hrTitle) setTitle(hrSection.data.hrTitle);
          if (hrSection.data.subtitle) setSubtitle(hrSection.data.subtitle);
          if (hrSection.data.hrDescription) setDescription(hrSection.data.hrDescription);
          if (hrSection.data.image) setImage(hrSection.data.image);
          if (hrSection.data.links && hrSection.data.links.length > 0) {
            const sortedLinks = [...hrSection.data.links].sort((a: HRPolicyLink, b: HRPolicyLink) => a.order - b.order);
            setLinks(sortedLinks);
          } else {
            // Default links
            setLinks([
              { text: 'İK Politikamız', href: '#ik-politika', order: 0 },
              { text: 'Kariyer Planlama', href: '#kariyer', order: 1 },
              { text: 'Açık Pozisyonlar & Başvuru', href: '#pozisyonlar', order: 2 },
            ]);
          }
        }
      }
    } catch (error) {
      logger.error('HR Policy verileri yüklenemedi:', error);
    }
  };

  return (
    <section className="hr-policy" id="ik">
      <div className="container">
        <div className="hr-content">
          <div className="hr-text">
            <h2>{title}</h2>
            <h3>{subtitle}</h3>
            <p>{description}</p>
            {links.length > 0 && (
              <div className="hr-links">
                {links.map((link, index) => (
                  <a key={index} href={link.href} className="btn btn-outline">
                    {link.text}
                  </a>
                ))}
              </div>
            )}
          </div>
          <div className="hr-image">
            {image ? (
              <Image 
                src={image} 
                alt={`${title} - ${subtitle}`} 
                width={800}
                height={600}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
                quality={85}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ) : (
              <div className="placeholder-image" aria-hidden="true">
                <i className="fas fa-users" aria-hidden="true"></i>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
