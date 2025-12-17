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

interface HomePageSection {
  _id?: string;
  type: 'hero' | 'about' | 'services' | 'hrpolicy' | 'news' | 'contact';
  order: number;
  isActive: boolean;
  data: {
    slides?: HeroSlide[];
    title?: string;
    description?: string;
    items?: AboutItem[];
    [key: string]: any;
  };
}

export default function HomePageSettings() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [sections, setSections] = useState<HomePageSection[]>([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getHomePageSettings();
      if (response.success && response.settings) {
        const sortedSections = [...response.settings.sections].sort((a, b) => a.order - b.order);
        setSections(sortedSections);
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
      data: type === 'hero' ? { slides: [] } : type === 'about' ? { title: '', description: '', items: [] } : {},
    };
    setSections([...sections, newSection]);
  };

  const removeSection = (index: number) => {
    const newSections = sections.filter((_, i) => i !== index);
    // Order'ları yeniden düzenle
    newSections.forEach((section, i) => {
      section.order = i;
    });
    setSections(newSections);
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
        <h1 style={{ fontSize: '24px', color: '#1f2937', fontWeight: '600', margin: 0, letterSpacing: '-0.5px' }}>Anasayfa Ayarları</h1>
        <Button onClick={handleSave} variant="primary" size="md" isLoading={submitting}>
          Kaydet
        </Button>
      </div>

      {/* Component Ekleme */}
      <div style={{
        background: 'white',
        padding: '1.5rem',
        borderRadius: '12px',
        marginBottom: '1.5rem',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#313131' }}>Yeni Component Ekle</h3>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {sections.map((section, index) => (
          <div
            key={index}
            style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <h3 style={{ margin: 0, color: '#313131', textTransform: 'capitalize' }}>
                  {section.type === 'hrpolicy' ? 'HR Policy' : section.type}
                </h3>
                <span style={{ color: '#666', fontSize: '0.9rem' }}>Sıra: {section.order}</span>
                <Checkbox
                  label="Aktif"
                  checked={section.isActive}
                  onChange={(e) => updateSection(index, 'isActive', e.target.checked)}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  onClick={() => moveSection(index, 'up')}
                  disabled={index === 0}
                  variant="secondary"
                  size="sm"
                >
                  ↑
                </Button>
                <Button
                  onClick={() => moveSection(index, 'down')}
                  disabled={index === sections.length - 1}
                  variant="secondary"
                  size="sm"
                >
                  ↓
                </Button>
                <Button
                  onClick={() => removeSection(index)}
                  variant="danger"
                  size="sm"
                >
                  Sil
                </Button>
              </div>
            </div>

            {/* Hero Component Edit */}
            {section.type === 'hero' && (
              <HeroSectionEditor
                section={section}
                index={index}
                updateSection={updateSection}
              />
            )}

            {/* About Component Edit */}
            {section.type === 'about' && (
              <AboutSectionEditor
                section={section}
                index={index}
                updateSection={updateSection}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Hero Section Editor Component
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ color: '#313131' }}>Hero Slides</h4>
        <Button onClick={addSlide} variant="secondary" size="sm">
          + Slide Ekle
        </Button>
      </div>
      {slides.map((slide, slideIndex) => (
        <div key={slideIndex} style={{
          background: '#f8fafc',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '0.75rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Input
              placeholder="Başlık *"
              value={slide.title}
              onChange={(e) => updateSlide(slideIndex, 'title', e.target.value)}
              required
            />
            <Input
              placeholder="Açıklama *"
              value={slide.description}
              onChange={(e) => updateSlide(slideIndex, 'description', e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Input
              placeholder="Link *"
              value={slide.link}
              onChange={(e) => updateSlide(slideIndex, 'link', e.target.value)}
              required
            />
            <Input
              placeholder="Buton Metni *"
              value={slide.linkText}
              onChange={(e) => updateSlide(slideIndex, 'linkText', e.target.value)}
              required
            />
            <Input
              placeholder="Resim URL *"
              value={slide.image}
              onChange={(e) => updateSlide(slideIndex, 'image', e.target.value)}
              required
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Input
              type="number"
              placeholder="Sıra"
              value={slide.order}
              onChange={(e) => updateSlide(slideIndex, 'order', parseInt(e.target.value) || 0)}
              style={{ width: '100px' }}
            />
            <Button
              onClick={() => removeSlide(slideIndex)}
              variant="danger"
              size="sm"
            >
              Slide Sil
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// About Section Editor Component
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
      <div style={{ marginBottom: '1rem' }}>
        <Input
          label="Başlık"
          value={section.data.title || ''}
          onChange={(e) => updateSection(index, 'data.title', e.target.value)}
        />
      </div>
      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#313131' }}>Açıklama</label>
        <textarea
          value={section.data.description || ''}
          onChange={(e) => updateSection(index, 'data.description', e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '1rem',
            minHeight: '100px',
            fontFamily: 'inherit',
            resize: 'vertical'
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h4 style={{ color: '#313131' }}>About Items</h4>
        <Button onClick={addItem} variant="secondary" size="sm">
          + Item Ekle
        </Button>
      </div>
      {items.map((item, itemIndex) => (
        <div key={itemIndex} style={{
          background: '#f8fafc',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '0.75rem',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <Input
              placeholder="Başlık *"
              value={item.title}
              onChange={(e) => updateItem(itemIndex, 'title', e.target.value)}
              required
            />
            <Input
              placeholder="Icon (örn: fas fa-globe)"
              value={item.icon || ''}
              onChange={(e) => updateItem(itemIndex, 'icon', e.target.value)}
            />
          </div>
          <textarea
            placeholder="Açıklama *"
            value={item.description}
            onChange={(e) => updateItem(itemIndex, 'description', e.target.value)}
            style={{
              width: '100%',
              padding: '0.625rem',
              border: '2px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '0.9rem',
              marginBottom: '0.75rem',
              minHeight: '80px',
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Input
              type="number"
              placeholder="Sıra"
              value={item.order}
              onChange={(e) => updateItem(itemIndex, 'order', parseInt(e.target.value) || 0)}
              style={{ width: '100px' }}
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
      ))}
    </div>
  );
}
