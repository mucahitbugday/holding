'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import LoadingScreen from '@/components/LoadingScreen';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import Swal from 'sweetalert2';


interface HeroSlide {
  _id?: string;
  title: string;
  description: string;
  link: string;
  linkText: string;
  image: string;
  order: number;
}

interface AboutItem {
  _id?: string;
  title: string;
  description: string;
  icon?: string;
  order: number;
}

interface ServiceItem {
  _id?: string;
  icon: string;
  title: string;
  description: string;
  order: number;
}

interface NewsItem {
  _id?: string;
  day: string;
  month: string;
  title: string;
  description: string;
  link?: string;
  order: number;
}

interface HRPolicyLink {
  _id?: string;
  text: string;
  href: string;
  order: number;
}

interface HomePageSection {
  _id?: string;
  type: 'hero' | 'about' | 'services' | 'hrpolicy' | 'news' | 'contact';
  order: number;
  isActive: boolean;
  data: {
    // Hero
    slides?: HeroSlide[];
    // About
    title?: string;
    description?: string;
    items?: AboutItem[];
    // Services
    servicesTitle?: string;
    servicesDescription?: string;
    services?: ServiceItem[];
    // HRPolicy
    hrTitle?: string;
    subtitle?: string;
    hrDescription?: string;
    links?: HRPolicyLink[];
    image?: string;
    // News
    newsTitle?: string;
    newsDescription?: string;
    news?: NewsItem[];
    // Contact
    contactTitle?: string;
    contactDescription?: string;
    [key: string]: any;
  };
}

// Default data for each component type
const getDefaultData = (type: HomePageSection['type']) => {
  switch (type) {
    case 'hero':
      return {
        slides: [
          {
            title: 'Dünya Standartlarında Hizmet',
            description: 'Sektörümüzle ilgili dünyadaki gelişmeleri takip ediyor ve işimizi sürekli olarak geliştiriyoruz.',
            link: '#hizmetler',
            linkText: 'Hizmetlerimiz',
            image: '/images/slide1.jpg',
            order: 0,
          },
        ],
      };
    case 'about':
      return {
        title: 'Hakkımızda',
        description: 'Şirketimiz hakkında bilgiler',
        items: [
          {
            title: 'Vizyonumuz',
            description: 'Sektörde öncü olmak ve müşterilerimize en iyi hizmeti sunmak',
            icon: 'fas fa-eye',
            order: 0,
          },
          {
            title: 'Misyonumuz',
            description: 'Kaliteli hizmet anlayışı ile müşteri memnuniyetini sağlamak',
            icon: 'fas fa-bullseye',
            order: 1,
          },
        ],
      };
    case 'services':
      return {
        servicesTitle: 'Hizmetlerimiz',
        servicesDescription: 'Geniş hizmet yelpazemizle ihtiyaçlarınıza çözüm üretiyoruz',
        services: [
          {
            icon: 'fas fa-laptop-code',
            title: 'Teknoloji',
            description: 'Modern teknoloji çözümleri ile işletmenizi geleceğe taşıyoruz.',
            order: 0,
          },
          {
            icon: 'fas fa-building',
            title: 'Entegre Tesis Yönetimi',
            description: 'Tesislerinizin tüm yönetim ihtiyaçlarını tek çatı altında topluyoruz.',
            order: 1,
          },
          {
            icon: 'fas fa-shield-alt',
            title: 'Güvenlik',
            description: 'Profesyonel güvenlik hizmetleri ile tesislerinizi koruyoruz.',
            order: 2,
          },
        ],
      };
    case 'hrpolicy':
      return {
        hrTitle: 'İK Politikamız',
        subtitle: 'İnsan Odaklı Yaklaşım',
        hrDescription: 'İnsana değer veriyoruz. Yaptığımız iş ne olursa olsun merkezinde insan var. Bu bilinçle insan ve çözüm odaklı bir yaklaşım benimsiyoruz.',
        links: [
          { text: 'İK Politikamız', href: '#ik-politika', order: 0 },
          { text: 'Kariyer Planlama', href: '#kariyer', order: 1 },
          { text: 'Açık Pozisyonlar & Başvuru', href: '#pozisyonlar', order: 2 },
        ],
        image: '/images/hr-policy.jpg',
      };
    case 'news':
      return {
        newsTitle: 'Haberler',
        newsDescription: 'Sektöre dair tüm gelişmeler ve en güncel haberleri bu sayfadan takip edebilirsiniz.',
        news: [
          {
            day: '29',
            month: 'Oca',
            title: 'Yeni Proje Başarıyla Tamamlandı',
            description: 'Büyük ölçekli bir projeyi başarıyla tamamladık ve müşterilerimize teslim ettik.',
            link: '#',
            order: 0,
          },
          {
            day: '06',
            month: 'Şub',
            title: 'Yeni Ofis Açılışı',
            description: 'Büyüyen iş hacmimiz nedeniyle yeni ofisimizi açtık.',
            link: '#',
            order: 1,
          },
        ],
      };
    case 'contact':
      return {
        contactTitle: 'İletişim',
        contactDescription: 'Bizimle iletişime geçmek için aşağıdaki bilgileri kullanabilirsiniz.',
      };
    default:
      return {};
  }
};

export default function HomePageSettings() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sections, setSections] = useState<HomePageSection[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadSettings();
  }, []);

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getHomePageSettings();
      if (response.success && response.settings) {
        const sortedSections = [...response.settings.sections].sort((a, b) => a.order - b.order);
        setSections(sortedSections);
        // İlk section'ı açık başlat (opsiyonel - isterseniz tümünü kapalı başlatabilirsiniz)
        if (sortedSections.length > 0) {
          setExpandedSections(new Set([0]));
        }
      } else {
        // Eğer hiç section yoksa default sectionlar ekle
        const defaultSections: HomePageSection[] = [
          {
            type: 'hero',
            order: 0,
            isActive: true,
            data: getDefaultData('hero'),
          },
          {
            type: 'about',
            order: 1,
            isActive: true,
            data: getDefaultData('about'),
          },
          {
            type: 'services',
            order: 2,
            isActive: true,
            data: getDefaultData('services'),
          },
          {
            type: 'hrpolicy',
            order: 3,
            isActive: true,
            data: getDefaultData('hrpolicy'),
          },
          {
            type: 'news',
            order: 4,
            isActive: true,
            data: getDefaultData('news'),
          },
          {
            type: 'contact',
            order: 5,
            isActive: true,
            data: getDefaultData('contact'),
          },
        ];
        setSections(defaultSections);
      }
    } catch (error) {
      console.error('Ayarlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSubmitting(true);
      await apiClient.updateHomePageSettings({ sections });
      await Swal.fire({
        icon: 'success',
        title: 'Başarılı!',
        text: 'Anasayfa ayarları başarıyla güncellendi.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: error.message || 'Bir hata oluştu'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const addSection = (type: HomePageSection['type']) => {
    const newSection: HomePageSection = {
      type,
      order: sections.length,
      isActive: true,
      data: getDefaultData(type),
    };
    const newSections = [...sections, newSection];
    setSections(newSections);
    // Yeni eklenen section'ı otomatik aç
    const newExpanded = new Set(expandedSections);
    newExpanded.add(newSections.length - 1);
    setExpandedSections(newExpanded);
  };

  const removeSection = (index: number) => {
    Swal.fire({
      title: 'Emin misiniz?',
      text: 'Bu component silinecek. Bu işlem geri alınamaz!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Evet, Sil!',
      cancelButtonText: 'İptal'
    }).then((result) => {
      if (result.isConfirmed) {
        const newSections = sections.filter((_, i) => i !== index);
        newSections.forEach((section, i) => {
          section.order = i;
        });
        setSections(newSections);
      }
    });
  };

  const updateSection = (index: number, field: string, value: any) => {
    const newSections = [...sections];
    if (field === 'isActive' || field === 'order') {
      (newSections[index] as any)[field] = value;
    } else if (field.startsWith('data.')) {
      const dataField = field.replace('data.', '');
      newSections[index].data[dataField] = value;
    }
    setSections(newSections);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === sections.length - 1) return;

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
    newSections[index].order = index;
    newSections[targetIndex].order = targetIndex;
    setSections(newSections);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ padding: '0' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h1 style={{ fontSize: '24px', color: '#1f2937', fontWeight: '600', margin: 0 }}>Anasayfa Ayarları</h1>
        <Button onClick={handleSave} variant="primary" size="md" isLoading={submitting}>
          Kaydet
        </Button>
      </div>

      {/* Component Ekleme */}
      <div style={{
        background: '#ffffff',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '24px',
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}>
        <h3 style={{ marginBottom: '16px', color: '#1f2937', fontSize: '18px', fontWeight: '600' }}>Yeni Component Ekle</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['hero', 'about', 'services', 'hrpolicy', 'news', 'contact'] as const).map((type) => (
            <Button
              key={type}
              onClick={() => addSection(type)}
              variant="secondary"
              size="sm"
            >
              + {type === 'hrpolicy' ? 'HR Policy' : type.charAt(0).toUpperCase() + type.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Componentler Listesi */}
      {sections.length === 0 ? (
        <div style={{
          background: '#ffffff',
          padding: '48px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Henüz component eklenmemiş. Yukarıdan yeni component ekleyebilirsiniz.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sections.map((section, index) => {
            const isExpanded = expandedSections.has(index);
            return (
              <div
                key={index}
                style={{
                  background: '#ffffff',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  overflow: 'hidden',
                  transition: 'all 0.2s'
                }}
              >
                {/* Header - Her zaman görünür */}
                <div 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    padding: '16px 20px',
                    cursor: 'pointer',
                    background: isExpanded ? '#f9fafb' : '#ffffff',
                    transition: 'background 0.2s'
                  }}
                  onClick={() => toggleSection(index)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', flex: 1 }}>
                    <button
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#6b7280',
                        transition: 'transform 0.2s',
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSection(index);
                      }}
                    >
                      <i className="fas fa-chevron-right" style={{ fontSize: '12px' }}></i>
                    </button>
                    <h3 style={{ margin: 0, color: '#1f2937', fontSize: '16px', fontWeight: '600', textTransform: 'capitalize' }}>
                      {section.type === 'hrpolicy' ? 'HR Policy' : section.type}
                    </h3>
                    <span style={{ color: '#6b7280', fontSize: '12px', background: '#f3f4f6', padding: '3px 8px', borderRadius: '4px' }}>
                      Sıra: {section.order}
                    </span>
                    <div onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        label="Aktif"
                        checked={section.isActive}
                        onChange={(e) => {
                          updateSection(index, 'isActive', e.target.checked);
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }} onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                      title="Yukarı Taşı"
                      style={{
                        padding: '6px 8px',
                        background: index === 0 ? '#f3f4f6' : '#f3f4f6',
                        color: index === 0 ? '#9ca3af' : '#1f2937',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: index === 0 ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        minWidth: '32px',
                        height: '32px',
                        opacity: index === 0 ? 0.5 : 1
                      }}
                    >
                      <i className="fas fa-arrow-up" style={{ fontSize: '12px' }}></i>
                    </button>
                    <button
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === sections.length - 1}
                      title="Aşağı Taşı"
                      style={{
                        padding: '6px 8px',
                        background: index === sections.length - 1 ? '#f3f4f6' : '#f3f4f6',
                        color: index === sections.length - 1 ? '#9ca3af' : '#1f2937',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: index === sections.length - 1 ? 'not-allowed' : 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        minWidth: '32px',
                        height: '32px',
                        opacity: index === sections.length - 1 ? 0.5 : 1
                      }}
                    >
                      <i className="fas fa-arrow-down" style={{ fontSize: '12px' }}></i>
                    </button>
                    <button
                      onClick={() => removeSection(index)}
                      title="Sil"
                      style={{
                        padding: '6px 8px',
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s',
                        minWidth: '32px',
                        height: '32px'
                      }}
                    >
                      <i className="fas fa-trash" style={{ fontSize: '12px' }}></i>
                    </button>
                  </div>
                </div>

                {/* Content - Sadece açıkken görünür */}
                {isExpanded && (
                  <div                   style={{ 
                    padding: '20px',
                    borderTop: '1px solid #e5e7eb',
                  }}>

                    {/* Component Editors */}
                    {section.type === 'hero' && (
                      <HeroSectionEditor
                        section={section}
                        index={index}
                        updateSection={updateSection}
                      />
                    )}

                    {section.type === 'about' && (
                      <AboutSectionEditor
                        section={section}
                        index={index}
                        updateSection={updateSection}
                      />
                    )}

                    {section.type === 'services' && (
                      <ServicesSectionEditor
                        section={section}
                        index={index}
                        updateSection={updateSection}
                      />
                    )}

                    {section.type === 'hrpolicy' && (
                      <HRPolicySectionEditor
                        section={section}
                        index={index}
                        updateSection={updateSection}
                      />
                    )}

                    {section.type === 'news' && (
                      <NewsSectionEditor
                        section={section}
                        index={index}
                        updateSection={updateSection}
                      />
                    )}

                    {section.type === 'contact' && (
                      <ContactSectionEditor
                        section={section}
                        index={index}
                        updateSection={updateSection}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Hero Section Editor
function HeroSectionEditor({ section, index, updateSection }: {
  section: HomePageSection;
  index: number;
  updateSection: (index: number, field: string, value: any) => void;
}) {
  const slides = section.data.slides || [];

  const addSlide = () => {
    const newSlides = [...slides, {
      title: '',
      description: '',
      link: '',
      linkText: '',
      image: '',
      order: slides.length,
    }];
    updateSection(index, 'data.slides', newSlides);
  };

  const updateSlide = (slideIndex: number, field: string, value: any) => {
    const newSlides = [...slides];
    newSlides[slideIndex] = { ...newSlides[slideIndex], [field]: value };
    updateSection(index, 'data.slides', newSlides);
  };

  const removeSlide = (slideIndex: number) => {
    const newSlides = slides.filter((_, i) => i !== slideIndex);
    updateSection(index, 'data.slides', newSlides);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>Hero Slides</h4>
        <Button onClick={addSlide} variant="primary" size="sm">
          + Slide Ekle
        </Button>
      </div>
      {slides.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: '14px', padding: '16px', background: '#f9fafb', borderRadius: '6px' }}>
          Henüz slide eklenmemiş. "Slide Ekle" butonuna tıklayarak slide ekleyebilirsiniz.
        </p>
      ) : (
        slides.map((slide, slideIndex) => (
          <div key={slideIndex} style={{
            background: '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <Input
                label="Başlık *"
                value={slide.title}
                onChange={(e) => updateSlide(slideIndex, 'title', e.target.value)}
                required
              />
              <Input
                label="Açıklama *"
                value={slide.description}
                onChange={(e) => updateSlide(slideIndex, 'description', e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <Input
                label="Link *"
                value={slide.link}
                onChange={(e) => updateSlide(slideIndex, 'link', e.target.value)}
                required
              />
              <Input
                label="Buton Metni *"
                value={slide.linkText}
                onChange={(e) => updateSlide(slideIndex, 'linkText', e.target.value)}
                required
              />
              <Input
                label="Resim URL *"
                value={slide.image}
                onChange={(e) => updateSlide(slideIndex, 'image', e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Input
                type="number"
                label="Sıra"
                value={slide.order}
                onChange={(e) => updateSlide(slideIndex, 'order', parseInt(e.target.value) || 0)}
                style={{ width: '120px' }}
              />
              <button
                onClick={() => removeSlide(slideIndex)}
                title="Slide Sil"
                style={{
                  padding: '6px 10px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                  minWidth: '36px',
                  height: '36px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#dc2626';
                }}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// About Section Editor
function AboutSectionEditor({ section, index, updateSection }: {
  section: HomePageSection;
  index: number;
  updateSection: (index: number, field: string, value: any) => void;
}) {
  const items = section.data.items || [];

  const addItem = () => {
    const newItems = [...items, {
      title: '',
      description: '',
      icon: 'fas fa-globe',
      order: items.length,
    }];
    updateSection(index, 'data.items', newItems);
  };

  const updateItem = (itemIndex: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
    updateSection(index, 'data.items', newItems);
  };

  const removeItem = (itemIndex: number) => {
    const newItems = items.filter((_, i) => i !== itemIndex);
    updateSection(index, 'data.items', newItems);
  };

  return (
    <div>
      <div style={{ marginBottom: '16px' }}>
        <Input
          label="Bölüm Başlığı"
          value={section.data.title || ''}
          onChange={(e) => updateSection(index, 'data.title', e.target.value)}
        />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>Bölüm Açıklaması</label>
        <textarea
          value={section.data.description || ''}
          onChange={(e) => updateSection(index, 'data.description', e.target.value)}
          rows={3}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>About Items</h4>
        <Button onClick={addItem} variant="primary" size="sm">
          + Item Ekle
        </Button>
      </div>
      {items.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: '14px', padding: '16px', background: '#f9fafb', borderRadius: '6px' }}>
          Henüz item eklenmemiş.
        </p>
      ) : (
        items.map((item, itemIndex) => (
          <div key={itemIndex} style={{
            background: '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <Input
                label="Başlık *"
                value={item.title}
                onChange={(e) => updateItem(itemIndex, 'title', e.target.value)}
                required
              />
              <Input
                label="Icon (örn: fas fa-globe)"
                value={item.icon || ''}
                onChange={(e) => updateItem(itemIndex, 'icon', e.target.value)}
              />
            </div>
            <textarea
              placeholder="Açıklama *"
              value={item.description}
              onChange={(e) => updateItem(itemIndex, 'description', e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '12px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Input
                type="number"
                label="Sıra"
                value={item.order}
                onChange={(e) => updateItem(itemIndex, 'order', parseInt(e.target.value) || 0)}
                style={{ width: '120px' }}
              />
              <Button
                onClick={() => removeItem(itemIndex)}
                variant="danger"
                size="sm"
              >
                Item Sil
              </Button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Services Section Editor
function ServicesSectionEditor({ section, index, updateSection }: {
  section: HomePageSection;
  index: number;
  updateSection: (index: number, field: string, value: any) => void;
}) {
  const services = section.data.services || [];

  const addService = () => {
    const newServices = [...services, {
      icon: 'fas fa-star',
      title: '',
      description: '',
      order: services.length,
    }];
    updateSection(index, 'data.services', newServices);
  };

  const updateService = (serviceIndex: number, field: string, value: any) => {
    const newServices = [...services];
    newServices[serviceIndex] = { ...newServices[serviceIndex], [field]: value };
    updateSection(index, 'data.services', newServices);
  };

  const removeService = (serviceIndex: number) => {
    const newServices = services.filter((_, i) => i !== serviceIndex);
    updateSection(index, 'data.services', newServices);
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <Input
          label="Bölüm Başlığı"
          value={section.data.servicesTitle || ''}
          onChange={(e) => updateSection(index, 'data.servicesTitle', e.target.value)}
        />
        <Input
          label="Bölüm Açıklaması"
          value={section.data.servicesDescription || ''}
          onChange={(e) => updateSection(index, 'data.servicesDescription', e.target.value)}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>Hizmetler</h4>
        <Button onClick={addService} variant="primary" size="sm">
          + Hizmet Ekle
        </Button>
      </div>
      {services.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: '14px', padding: '16px', background: '#f9fafb', borderRadius: '6px' }}>
          Henüz hizmet eklenmemiş.
        </p>
      ) : (
        services.map((service, serviceIndex) => (
          <div key={serviceIndex} style={{
            background: '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <Input
                label="Icon (örn: fas fa-laptop-code) *"
                value={service.icon}
                onChange={(e) => updateService(serviceIndex, 'icon', e.target.value)}
                required
              />
              <Input
                label="Başlık *"
                value={service.title}
                onChange={(e) => updateService(serviceIndex, 'title', e.target.value)}
                required
              />
            </div>
            <textarea
              placeholder="Açıklama *"
              value={service.description}
              onChange={(e) => updateService(serviceIndex, 'description', e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '12px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Input
                type="number"
                label="Sıra"
                value={service.order}
                onChange={(e) => updateService(serviceIndex, 'order', parseInt(e.target.value) || 0)}
                style={{ width: '120px' }}
              />
              <button
                onClick={() => removeService(serviceIndex)}
                title="Hizmet Sil"
                style={{
                  padding: '6px 10px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                  minWidth: '36px',
                  height: '36px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#dc2626';
                }}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// HRPolicy Section Editor
function HRPolicySectionEditor({ section, index, updateSection }: {
  section: HomePageSection;
  index: number;
  updateSection: (index: number, field: string, value: any) => void;
}) {
  const links = section.data.links || [];

  const addLink = () => {
    const newLinks = [...links, {
      text: '',
      href: '',
      order: links.length,
    }];
    updateSection(index, 'data.links', newLinks);
  };

  const updateLink = (linkIndex: number, field: string, value: any) => {
    const newLinks = [...links];
    newLinks[linkIndex] = { ...newLinks[linkIndex], [field]: value };
    updateSection(index, 'data.links', newLinks);
  };

  const removeLink = (linkIndex: number) => {
    const newLinks = links.filter((_, i) => i !== linkIndex);
    updateSection(index, 'data.links', newLinks);
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <Input
          label="Başlık"
          value={section.data.hrTitle || ''}
          onChange={(e) => updateSection(index, 'data.hrTitle', e.target.value)}
        />
        <Input
          label="Alt Başlık"
          value={section.data.subtitle || ''}
          onChange={(e) => updateSection(index, 'data.subtitle', e.target.value)}
        />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>Açıklama</label>
        <textarea
          value={section.data.hrDescription || ''}
          onChange={(e) => updateSection(index, 'data.hrDescription', e.target.value)}
          rows={4}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      </div>
      <div style={{ marginBottom: '12px' }}>
        <Input
          label="Resim URL"
          value={section.data.image || ''}
          onChange={(e) => updateSection(index, 'data.image', e.target.value)}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>Linkler</h4>
        <Button onClick={addLink} variant="primary" size="sm">
          + Link Ekle
        </Button>
      </div>
      {links.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: '14px', padding: '16px', background: '#f9fafb', borderRadius: '6px' }}>
          Henüz link eklenmemiş.
        </p>
      ) : (
        links.map((link, linkIndex) => (
          <div key={linkIndex} style={{
            background: '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <Input
                label="Link Metni *"
                value={link.text}
                onChange={(e) => updateLink(linkIndex, 'text', e.target.value)}
                required
              />
              <Input
                label="Link URL *"
                value={link.href}
                onChange={(e) => updateLink(linkIndex, 'href', e.target.value)}
                required
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Input
                type="number"
                label="Sıra"
                value={link.order}
                onChange={(e) => updateLink(linkIndex, 'order', parseInt(e.target.value) || 0)}
                style={{ width: '120px' }}
              />
              <button
                onClick={() => removeLink(linkIndex)}
                title="Link Sil"
                style={{
                  padding: '6px 10px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                  minWidth: '36px',
                  height: '36px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#dc2626';
                }}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// News Section Editor
function NewsSectionEditor({ section, index, updateSection }: {
  section: HomePageSection;
  index: number;
  updateSection: (index: number, field: string, value: any) => void;
}) {
  const news = section.data.news || [];

  const addNews = () => {
    const newNews = [...news, {
      day: '01',
      month: 'Oca',
      title: '',
      description: '',
      link: '#',
      order: news.length,
    }];
    updateSection(index, 'data.news', newNews);
  };

  const updateNews = (newsIndex: number, field: string, value: any) => {
    const newNews = [...news];
    newNews[newsIndex] = { ...newNews[newsIndex], [field]: value };
    updateSection(index, 'data.news', newNews);
  };

  const removeNews = (newsIndex: number) => {
    const newNews = news.filter((_, i) => i !== newsIndex);
    updateSection(index, 'data.news', newNews);
  };

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <Input
          label="Bölüm Başlığı"
          value={section.data.newsTitle || ''}
          onChange={(e) => updateSection(index, 'data.newsTitle', e.target.value)}
        />
        <Input
          label="Bölüm Açıklaması"
          value={section.data.newsDescription || ''}
          onChange={(e) => updateSection(index, 'data.newsDescription', e.target.value)}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ color: '#1f2937', fontSize: '16px', fontWeight: '600' }}>Haberler</h4>
        <Button onClick={addNews} variant="primary" size="sm">
          + Haber Ekle
        </Button>
      </div>
      {news.length === 0 ? (
        <p style={{ color: '#6b7280', fontSize: '14px', padding: '16px', background: '#f9fafb', borderRadius: '6px' }}>
          Henüz haber eklenmemiş.
        </p>
      ) : (
        news.map((item, newsIndex) => (
          <div key={newsIndex} style={{
            background: '#f9fafb',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '12px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <Input
                label="Gün *"
                value={item.day}
                onChange={(e) => updateNews(newsIndex, 'day', e.target.value)}
                required
              />
              <Input
                label="Ay (örn: Oca) *"
                value={item.month}
                onChange={(e) => updateNews(newsIndex, 'month', e.target.value)}
                required
              />
              <Input
                label="Link"
                value={item.link || ''}
                onChange={(e) => updateNews(newsIndex, 'link', e.target.value)}
              />
            </div>
            <div style={{ marginBottom: '12px' }}>
              <Input
                label="Başlık *"
                value={item.title}
                onChange={(e) => updateNews(newsIndex, 'title', e.target.value)}
                required
              />
            </div>
            <textarea
              placeholder="Açıklama *"
              value={item.description}
              onChange={(e) => updateNews(newsIndex, 'description', e.target.value)}
              rows={3}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                marginBottom: '12px',
                fontFamily: 'inherit',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Input
                type="number"
                label="Sıra"
                value={item.order}
                onChange={(e) => updateNews(newsIndex, 'order', parseInt(e.target.value) || 0)}
                style={{ width: '120px' }}
              />
              <button
                onClick={() => removeNews(newsIndex)}
                title="Haber Sil"
                style={{
                  padding: '6px 10px',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                  minWidth: '36px',
                  height: '36px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#b91c1c';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#dc2626';
                }}
              >
                <i className="fas fa-trash"></i>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// Contact Section Editor
function ContactSectionEditor({ section, index, updateSection }: {
  section: HomePageSection;
  index: number;
  updateSection: (index: number, field: string, value: any) => void;
}) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <Input
          label="Bölüm Başlığı"
          value={section.data.contactTitle || ''}
          onChange={(e) => updateSection(index, 'data.contactTitle', e.target.value)}
        />
        <Input
          label="Bölüm Açıklaması"
          value={section.data.contactDescription || ''}
          onChange={(e) => updateSection(index, 'data.contactDescription', e.target.value)}
        />
      </div>
      <p style={{ color: '#6b7280', fontSize: '13px', marginTop: '12px', padding: '12px', background: '#f9fafb', borderRadius: '6px' }}>
        İletişim bilgileri Settings sayfasından yönetilmektedir. Bu bölüm sadece başlık ve açıklama içindir.
      </p>
    </div>
  );
}
