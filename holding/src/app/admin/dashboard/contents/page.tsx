'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import Modal from '@/components/Modal';
import LoadingScreen from '@/components/LoadingScreen';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Swal from 'sweetalert2';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// React Quill'i dynamic import ile yükle (SSR sorunlarını önlemek için)
const ReactQuill = dynamic(() => import('react-quill-new').then(mod => ({ default: mod.default })), { ssr: false }) as any;

interface ContentSection {
  type: 'text' | 'card' | 'component';
  order: number;
  content?: string;
  contentId?: string; // Backward compatibility
  contentIds?: string[]; // Birden fazla kart için
  componentId?: string; // Component ID
}

interface Content {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  content: string;
  sections?: ContentSection[];
  type: 'page';
  categoryId?: string;
  isActive: boolean;
  order?: number;
  featuredImage?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  metadata?: {
    image?: string;
    keywords?: string[];
    [key: string]: any;
  };
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  order?: number;
  autoAddContent?: boolean;
  autoAddLimit?: number;
}


export default function ContentManagement() {
  const [contents, setContents] = useState<Content[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [cardModalCategoryFilter, setCardModalCategoryFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    description: '',
    content: '',
    sections: [] as ContentSection[],
    type: 'page' as Content['type'],
    categoryId: '',
    isActive: true,
    order: 0,
    featuredImage: '',
  });
  const [editingSectionIndex, setEditingSectionIndex] = useState<number | null>(null);
  const [editingSectionContent, setEditingSectionContent] = useState<string>('');
  const [showCardSelectModal, setShowCardSelectModal] = useState(false);
  const [tempSectionIndex, setTempSectionIndex] = useState<number | null>(null);

  const addTextSection = () => {
    const newSection: ContentSection = {
      type: 'text',
      order: formData.sections.length,
      content: ''
    };
    setFormData({
      ...formData,
      sections: [...formData.sections, newSection]
    });
    setEditingSectionIndex(formData.sections.length);
    setEditingSectionContent('');
  };

  const addCardSection = () => {
    const newSection: ContentSection = {
      type: 'card',
      order: formData.sections.length,
      contentIds: []
    };
    setFormData({
      ...formData,
      sections: [...formData.sections, newSection]
    });
    setTempSectionIndex(formData.sections.length);
    setShowCardSelectModal(true);
  };

  const addComponentSection = () => {
    const newSection: ContentSection = {
      type: 'component',
      order: formData.sections.length,
      componentId: ''
    };
    setFormData({
      ...formData,
      sections: [...formData.sections, newSection]
    });
  };

  const [selectedCardIds, setSelectedCardIds] = useState<Set<string>>(new Set());

  const toggleCardSelection = (contentId: string) => {
    const newSelected = new Set(selectedCardIds);
    if (newSelected.has(contentId)) {
      newSelected.delete(contentId);
    } else {
      newSelected.add(contentId);
    }
    setSelectedCardIds(newSelected);
  };

  const confirmCardSelection = () => {
    if (tempSectionIndex !== null) {
      const updatedSections = [...formData.sections];
      if (updatedSections[tempSectionIndex]) {
        // Seçilen kartları ekle (mevcut kartları koru)
        const currentIds = updatedSections[tempSectionIndex].contentIds || [];
        const newIds = Array.from(selectedCardIds);
        // Sadece yeni seçilenleri ekle (duplikasyonları önle)
        const allIds = [...new Set([...currentIds, ...newIds])];
        updatedSections[tempSectionIndex].contentIds = allIds;
      }
      setFormData({
        ...formData,
        sections: updatedSections
      });
    }
    setShowCardSelectModal(false);
    setTempSectionIndex(null);
    setSelectedCardIds(new Set());
  };

  const updateSectionContent = (index: number, content: string) => {
    const updatedSections = [...formData.sections];
    updatedSections[index].content = content;
    setFormData({
      ...formData,
      sections: updatedSections
    });
  };

  const deleteSection = (index: number) => {
    const updatedSections = formData.sections.filter((_, i) => i !== index);
    // Order'ları yeniden düzenle
    updatedSections.forEach((section, i) => {
      section.order = i;
    });
    setFormData({
      ...formData,
      sections: updatedSections
    });
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === formData.sections.length - 1) return;

    const updatedSections = [...formData.sections];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updatedSections[index], updatedSections[newIndex]] = [updatedSections[newIndex], updatedSections[index]];
    updatedSections[index].order = index;
    updatedSections[newIndex].order = newIndex;
    setFormData({
      ...formData,
      sections: updatedSections
    });
  };
  const [quillInstance, setQuillInstance] = useState<any>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [expandedContents, setExpandedContents] = useState<Set<string>>(new Set());
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [menus, setMenus] = useState<any[]>([]);
  const [linkSearchTerm, setLinkSearchTerm] = useState('');

  useEffect(() => {
    loadContents();
    loadMedia();
    loadMenus();
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await apiClient.getCategories();
      setCategories(response.categories || []);
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error);
    }
  };

  const createSlug = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };


  const loadMenus = async () => {
    try {
      const response = await apiClient.getMenus();
      setMenus(response.menus || []);
    } catch (error) {
      console.error('Menüler yüklenemedi:', error);
    }
  };

  // Media dosyası kontrolü
  const isMediaFile = (href: string): boolean => {
    if (!href) return false;
    // Media klasörü kontrolü
    if (href.includes('/uploads/') || href.includes('/media/')) return true;
    // Dosya uzantıları kontrolü
    const mediaExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.mp4', '.mp3', '.doc', '.docx', '.xls', '.xlsx'];
    const lowerHref = href.toLowerCase();
    return mediaExtensions.some(ext => lowerHref.endsWith(ext));
  };

  // Tüm menü linklerini topla (ana menü ve alt menüler)
  const getAllMenuLinks = (): Array<{ label: string; href: string; menuName: string; imageUrl?: string; isChild?: boolean }> => {
    const links: Array<{ label: string; href: string; menuName: string; imageUrl?: string; isChild?: boolean }> = [];

    menus.forEach((menu) => {
      if (!menu.isActive) return;

      menu.items?.forEach((item: any) => {
        // Ana menü öğesi - sadece href varsa, boş değilse ve media dosyası değilse
        if (item.href && item.href.trim() && !item.href.startsWith('#') && item.href !== '/' && !isMediaFile(item.href)) {
          links.push({
            label: item.label,
            href: item.href,
            menuName: menu.name,
            imageUrl: item.imageUrl,
            isChild: false
          });
        }

        // Alt menü öğeleri
        if (item.children && Array.isArray(item.children)) {
          item.children.forEach((child: any) => {
            if (child.href && child.href.trim() && !child.href.startsWith('#') && child.href !== '/' && !isMediaFile(child.href)) {
              links.push({
                label: `${item.label} > ${child.label}`,
                href: child.href,
                menuName: menu.name,
                imageUrl: child.imageUrl,
                isChild: true
              });
            }
          });
        }
      });
    });

    return links;
  };

  // Kullanılmış slug'ları topla (düzenleme modundaysak mevcut içeriğin slug'ını hariç tut)
  const getUsedSlugs = (): Set<string> => {
    const usedSlugs = new Set<string>();
    contents.forEach(content => {
      if (content.slug) {
        // Düzenleme modundaysak, mevcut içeriğin slug'ını hariç tut
        if (editingContent && editingContent._id === content._id) {
          return; // Bu slug'ı atla
        }
        usedSlugs.add(content.slug.toLowerCase());
      }
    });
    return usedSlugs;
  };

  // Link'ten slug'a dönüştür
  const hrefToSlug = (href: string): string => {
    let slug = href;
    if (slug.startsWith('/')) {
      slug = slug.substring(1);
    }
    // Sadece slug kısmını al (query string veya hash varsa kaldır)
    slug = slug.split('?')[0].split('#')[0];
    return slug.toLowerCase();
  };

  const usedSlugs = getUsedSlugs();
  const allLinks = getAllMenuLinks();

  // Kullanılmamış linkleri filtrele
  const availableLinks = allLinks.filter(link => {
    const slug = hrefToSlug(link.href);
    return !usedSlugs.has(slug);
  });

  const filteredLinks = availableLinks.filter(link =>
    link.label.toLowerCase().includes(linkSearchTerm.toLowerCase()) ||
    link.href.toLowerCase().includes(linkSearchTerm.toLowerCase())
  );

  useEffect(() => {
    if (showModal && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        const quillEditor = document.querySelector('.ql-editor') as any;
        if (quillEditor && quillEditor.__quill) {
          setQuillInstance(quillEditor.__quill);
        }
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setQuillInstance(null);
    }
  }, [showModal]);

  const loadContents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getContents();
      setContents(response.contents || []);
    } catch (error) {
      console.error('İçerikler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMedia = async () => {
    try {
      const response = await apiClient.getMedia('image');
      setMediaFiles(response.files || []);
    } catch (error) {
      console.error('Medya dosyaları yüklenemedi:', error);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Sections'ı temizle ve düzenle
      const cleanedSections = formData.sections.map((section, idx) => {
        const cleaned: ContentSection = {
          type: section.type,
          order: idx
        };

        if (section.type === 'text') {
          cleaned.content = section.content || '';
        } else if (section.type === 'card') {
          // contentIds varsa onu kullan, yoksa contentId'yi array'e çevir
          if (section.contentIds && section.contentIds.length > 0) {
            cleaned.contentIds = section.contentIds;
          } else if (section.contentId) {
            cleaned.contentIds = [section.contentId];
          } else {
            cleaned.contentIds = [];
          }
        } else if (section.type === 'component') {
          cleaned.componentId = section.componentId || '';
        }

        return cleaned;
      });

      const submitData: any = {
        slug: formData.slug,
        title: formData.title,
        description: formData.description || '',
        type: formData.type,
        categoryId: formData.categoryId || undefined,
        isActive: formData.isActive,
        order: formData.order,
        featuredImage: formData.featuredImage || '',
        sections: cleanedSections,
        metadata: {
          image: formData.featuredImage || '',
        },
        // Content field'ını her zaman gönder (sections varsa bile boş string olarak)
        content: formData.sections && formData.sections.length > 0 ? '' : (formData.content || ''),
      };

      console.log('Submitting data:', JSON.stringify(submitData, null, 2));

      let response;
      if (editingContent) {
        response = await apiClient.updateContent(editingContent._id, submitData);
        console.log('Update response:', response);
      } else {
        response = await apiClient.createContent(submitData);
        console.log('Create response:', response);
      }

      if (!response.success) {
        throw new Error(response.error || 'Kayıt başarısız oldu');
      }

      const newContentId = response.content?._id || response.content?.id;

      // Otomatik içerik ekleme: Eğer kategori autoAddContent aktifse ve yeni içerik oluşturulduysa
      if (!editingContent && newContentId && formData.categoryId) {
        const selectedCategory = categories.find(cat => cat._id === formData.categoryId);
        if (selectedCategory?.autoAddContent) {
          try {
            // Bu kategorinin içeriklerini bul
            const categoryContents = await apiClient.getContents(undefined, undefined, formData.categoryId);
            const categoryContentList = categoryContents.contents || [];
            
            // Bu kategorinin içeriklerinden kart bölümü olanları bul
            const contentsWithCardSections = categoryContentList.filter((content: any) => {
              return content.sections && content.sections.some((section: any) => section.type === 'card');
            });

            // Her bir içeriğin kart bölümlerine yeni içeriği ekle
            for (const content of contentsWithCardSections) {
              const updatedSections = content.sections.map((section: any) => {
                if (section.type === 'card') {
                  const existingIds = section.contentIds || [];
                  // Yeni içeriği başa ekle (en yeni en üstte)
                  const newIds = [newContentId, ...existingIds];
                  // Limit'e göre kes (son X kart)
                  const limit = selectedCategory.autoAddLimit || 5;
                  const limitedIds = newIds.slice(0, limit);
                  
                  return {
                    ...section,
                    contentIds: limitedIds
                  };
                }
                return section;
              });

              // İçeriği güncelle
              await apiClient.updateContent(content._id, {
                ...content,
                sections: updatedSections
              });
            }
          } catch (autoAddError) {
            console.error('Otomatik içerik ekleme hatası:', autoAddError);
            // Hata olsa bile ana işlemi devam ettir
          }
        }
      }

      setShowModal(false);
      setEditingContent(null);
      setEditingSectionIndex(null);
      setEditingSectionContent('');
      setFormData({
        slug: '',
        title: '',
        description: '',
        content: '',
        sections: [],
        type: 'page',
        categoryId: '',
        isActive: true,
        order: 0,
        featuredImage: '',
      });
      await loadContents();
      await Swal.fire({
        icon: 'success',
        title: 'Başarılı!',
        text: editingContent ? 'İçerik başarıyla güncellendi.' : 'İçerik başarıyla oluşturuldu.',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
    } catch (error: any) {
      console.error('Submit error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: error.message || 'Bir hata oluştu',
        confirmButtonColor: '#1f2937',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (content: Content) => {
    setEditingContent(content);
    setFormData({
      slug: content.slug,
      title: content.title,
      description: content.description || '',
      content: content.content,
      sections: content.sections || [],
      type: content.type,
      categoryId: content.categoryId || '',
      isActive: content.isActive,
      order: content.order || 0,
      featuredImage: content.featuredImage || content.metadata?.image || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('handleDelete called with id:', id);
      console.log('Swal available:', typeof Swal !== 'undefined');

      const result = await Swal.fire({
        title: 'Emin misiniz?',
        text: 'Bu içeriği silmek istediğinize emin misiniz?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Evet, Sil!',
        cancelButtonText: 'İptal',
      });

      console.log('Swal result:', result);

      if (!result.isConfirmed) {
        console.log('User cancelled deletion');
        return;
      }

      console.log('Deleting content...');
      await apiClient.deleteContent(id);
      await loadContents();

      await Swal.fire({
        icon: 'success',
        title: 'Silindi!',
        text: 'İçerik başarıyla silindi.',
        timer: 2000,
        showConfirmButton: false,
        toast: true,
        position: 'top-end',
      });
    } catch (error: any) {
      console.error('Delete error:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: error.message || 'Bir hata oluştu',
        confirmButtonColor: '#1f2937',
      });
    }
  };

  const toggleContentDetails = (id: string) => {
    const newExpanded = new Set(expandedContents);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedContents(newExpanded);
  };

  const openNewContentModal = () => {
    setEditingContent(null);
    setFormData({
      slug: '',
      title: '',
      description: '',
      content: '',
      sections: [],
      type: 'page',
      categoryId: '',
      isActive: true,
      order: 0,
      featuredImage: '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingContent(null);
    setQuillInstance(null);
    setEditingSectionIndex(null);
    setEditingSectionContent('');
    setFormData({
      slug: '',
      title: '',
      description: '',
      content: '',
      sections: [],
      type: 'page',
      categoryId: '',
      isActive: true,
      order: 0,
      featuredImage: '',
    });
  };


  // Quill modülleri ve toolbar konfigürasyonu
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        [{ 'align': [] }, { 'direction': 'rtl' }],
        ['link', 'image', 'video'],
        ['blockquote', 'code-block'],
        ['clean']
      ]
    },
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align', 'direction',
    'link', 'image', 'video',
    'blockquote', 'code-block'
  ];

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
        borderBottom: '1px solid #e5e7eb',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <h1 style={{ fontSize: '24px', color: '#1f2937', fontWeight: '600', margin: 0, letterSpacing: '-0.5px' }}>İçerik Yönetimi</h1>
        <Button onClick={openNewContentModal} variant="primary" size="md">
          + Yeni İçerik
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
        {/* Kategori Sidebar */}
        <aside style={{
          width: '280px',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '20px',
          position: 'sticky',
          top: '24px',
          maxHeight: 'calc(100vh - 120px)',
          overflowY: 'auto',
          flexShrink: 0
        }}>
              <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937', margin: '0 0 16px 0' }}>
              Kategoriler
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={() => setSelectedCategoryFilter('all')}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: selectedCategoryFilter === 'all' ? '#f3f4f6' : 'transparent',
                  color: selectedCategoryFilter === 'all' ? '#1f2937' : '#6b7280',
                  fontWeight: selectedCategoryFilter === 'all' ? '600' : '500',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategoryFilter !== 'all') {
                    e.currentTarget.style.background = '#f9fafb';
                    e.currentTarget.style.color = '#1f2937';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategoryFilter !== 'all') {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#6b7280';
                  }
                }}
              >
                Tümü
              </button>
              <button
                onClick={() => setSelectedCategoryFilter('none')}
                style={{
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  background: selectedCategoryFilter === 'none' ? '#f3f4f6' : 'transparent',
                  color: selectedCategoryFilter === 'none' ? '#1f2937' : '#6b7280',
                  fontWeight: selectedCategoryFilter === 'none' ? '600' : '500',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Kategorisiz
                </div>
                <span style={{
                  background: '#e0e7ff',
                  color: '#6366f1',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {contents.filter(c => !c.categoryId).length}
                </span>
              </button>
              {categories.map((category) => {
                const categoryContentCount = contents.filter(c => c.categoryId === category._id).length;
                return (
                  <button
                    key={category._id}
                    onClick={() => setSelectedCategoryFilter(category._id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      background: selectedCategoryFilter === category._id ? '#f3f4f6' : 'transparent',
                      color: selectedCategoryFilter === category._id ? '#1f2937' : '#6b7280',
                      fontWeight: selectedCategoryFilter === category._id ? '600' : '500',
                      fontSize: '14px',
                      cursor: 'pointer',
                      textAlign: 'left',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{category.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                      <span style={{
                        background: '#e0e7ff',
                        color: '#6366f1',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500'
                      }}>
                        {categoryContentCount}
                      </span>
                      {!category.isActive && (
                        <span style={{ fontSize: '10px', color: '#9ca3af' }}>●</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* İçerik Listesi */}
        <div style={{ flex: 1, minWidth: 0 }}>

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingContent ? 'İçerik Düzenle' : 'Yeni İçerik Ekle'}
        size="xlarge"
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button type="button" onClick={closeModal} variant="outline" size="md" disabled={submitting}>
              İptal
            </Button>
            <Button type="submit" form="content-form" variant="primary" size="md" isLoading={submitting}>
              {editingContent ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        }
      >
        <form id="content-form" onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px', flexShrink: 0 }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                Slug <span style={{ color: '#6b7280', fontWeight: '400' }}>(Opsiyonel - Kart içerikleri için otomatik oluşturulur)</span>
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ position: 'relative', flex: 1 }}>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="Menüden link seçin veya boş bırakın"
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        fontSize: '14px',
                        background: '#ffffff',
                        color: '#1f2937',
                        transition: 'all 0.15s',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = '#9ca3af';
                        e.currentTarget.style.outline = 'none';
                        e.currentTarget.style.boxShadow = '0 0 0 3px rgba(156, 163, 175, 0.1)';
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    />
                    {formData.slug && (
                      <div style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span style={{
                          fontSize: '11px',
                          color: '#10b981',
                          background: '#d1fae5',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}>
                          ✓ Seçildi
                        </span>
                      </div>
                    )}
                  </div>
                  <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#6b7280', lineHeight: '1.4' }}>
                    Sayfa içerikleri için menüden link seçin, kart içerikleri için boş bırakabilirsiniz
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => {
                    setLinkSearchTerm('');
                    setShowLinkModal(true);
                  }}
                  variant="primary"
                  size="md"
                  style={{
                    whiteSpace: 'nowrap',
                    minWidth: '120px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    alignSelf: 'flex-start'
                  }}
                >
                  Link Seç
                </Button>
              </div>
            </div>
            <div>
              <Select
                label="Durum"
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                options={[
                  { value: 'active', label: 'Aktif' },
                  { value: 'inactive', label: 'Pasif' },
                ]}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <Input
                label="Başlık"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="İçerik başlığı"
              />
            </div>
            <div>
              <Select
                label="Kategori"
                value={formData.categoryId || ''}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                options={[
                  { value: '', label: 'Kategori Seçiniz' },
                  ...categories.map(cat => ({ value: cat._id, label: cat.name }))
                ]}
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <Input
              label="Açıklama"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Kısa açıklama (opsiyonel)"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>Öne Çıkan Görsel (Sayfa Başı)</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <Input
                value={formData.featuredImage}
                onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                placeholder="/uploads/image.jpg veya URL"
                style={{ flex: 1 }}
              />
              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <Button
                  type="button"
                  onClick={() => {
                    loadMedia();
                    setShowMediaModal(true);
                  }}
                  variant="outline"
                  size="md"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Görsel Seç
                </Button>
              </div>
            </div>
            {formData.featuredImage && (
              <div style={{ marginTop: '12px' }}>
                <img
                  src={formData.featuredImage}
                  alt="Öne çıkan görsel"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '150px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    objectFit: 'contain'
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div style={{ marginBottom: '20px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
              <label style={{ fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>İçerik Bölümleri</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <Button
                  type="button"
                  onClick={addTextSection}
                  variant="primary"
                  size="sm"
                >
                  İçerik Ekle
                </Button>
                <Button
                  type="button"
                  onClick={addCardSection}
                  variant="primary"
                  size="sm"
                >
                  Kart Ekle
                </Button>
                <Button
                  type="button"
                  onClick={addComponentSection}
                  variant="primary"
                  size="sm"
                >
                  Component Ekle
                </Button>
              </div>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: '8px' }}>
            {formData.sections.length === 0 ? (
              <div style={{
                padding: '3rem',
                textAlign: 'center',
                background: '#f9fafb',
                borderRadius: '6px',
                border: '1px dashed #e5e7eb'
              }}>
                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                  Henüz içerik bölümü eklenmemiş. Yukarıdaki butonlarla ekleyebilirsiniz.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {formData.sections.map((section, index) => (
                  <div
                    key={index}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '6px',
                      background: '#ffffff',
                      overflow: 'hidden'
                    }}
                  >
                    <div style={{
                      padding: '12px 16px',
                      background: '#f9fafb',
                      borderBottom: '1px solid #e5e7eb',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{
                          fontSize: '12px',
                          fontWeight: '600',
                          color: section.type === 'text' ? '#1f2937' : section.type === 'card' ? '#6366f1' : '#10b981',
                          background: section.type === 'text' ? '#e5e7eb' : section.type === 'card' ? '#e0e7ff' : '#d1fae5',
                          padding: '4px 8px',
                          borderRadius: '4px'
                        }}>
                          {section.type === 'text' ? 'Metin' : section.type === 'card' ? 'Kart' : 'Component'}
                        </span>
                        {section.type === 'card' && (
                          <span style={{ fontSize: '13px', color: '#6b7280' }}>
                            {(() => {
                              const cardIds = section.contentIds || (section.contentId ? [section.contentId] : []);
                              if (cardIds.length === 0) return 'Kart seçilmedi';
                              return `${cardIds.length} kart seçildi`;
                            })()}
                          </span>
                        )}
                        {section.type === 'component' && (
                          <span style={{ fontSize: '13px', color: '#6b7280' }}>
                            {section.componentId ? 'Component seçildi' : 'Component seçilmedi'}
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          onClick={() => moveSection(index, 'up')}
                          disabled={index === 0}
                          style={{
                            background: 'transparent',
                            border: '1px solid #e5e7eb',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: index === 0 ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            color: index === 0 ? '#9ca3af' : '#1f2937',
                            opacity: index === 0 ? 0.5 : 1
                          }}
                        >
                          ↑
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSection(index, 'down')}
                          disabled={index === formData.sections.length - 1}
                          style={{
                            background: 'transparent',
                            border: '1px solid #e5e7eb',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: index === formData.sections.length - 1 ? 'not-allowed' : 'pointer',
                            fontSize: '12px',
                            color: index === formData.sections.length - 1 ? '#9ca3af' : '#1f2937',
                            opacity: index === formData.sections.length - 1 ? 0.5 : 1
                          }}
                        >
                          ↓
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteSection(index)}
                          style={{
                            background: 'transparent',
                            border: '1px solid #ef4444',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            color: '#ef4444'
                          }}
                        >
                          Sil
                        </button>
                      </div>
                    </div>
                    {section.type === 'text' ? (
                      <div style={{ padding: '16px' }}>
                        {editingSectionIndex === index ? (
                          <div style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '6px',
                            background: '#ffffff',
                            overflow: 'hidden'
                          }}>
                            <style>{`
                              .section-quill .ql-container {
                                font-size: 14px;
                                min-height: 400px;
                                max-height: 600px;
                              }
                              .section-quill .ql-editor {
                                min-height: 400px;
                                max-height: 600px;
                                overflow-y: auto;
                              }
                              .section-quill .ql-toolbar {
                                border-top: none;
                                border-left: none;
                                border-right: none;
                                border-bottom: 1px solid #e5e7eb;
                                background: #f9fafb;
                                position: sticky;
                                top: 0;
                                z-index: 10;
                              }
                              .section-quill .ql-container {
                                border-bottom: none;
                                border-left: none;
                                border-right: none;
                                border-top: none;
                              }
                            `}</style>
                            <div className="section-quill">
                              <ReactQuill
                                theme="snow"
                                value={editingSectionContent}
                                onChange={(value: string) => {
                                  setEditingSectionContent(value);
                                  updateSectionContent(index, value);
                                }}
                                modules={modules}
                                formats={formats}
                                placeholder="İçeriğinizi buraya yazın..."
                              />
                            </div>
                            <div style={{ padding: '12px', borderTop: '1px solid #e5e7eb', display: 'flex', justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSectionIndex(null);
                                  setEditingSectionContent('');
                                }}
                                style={{
                                  background: '#1f2937',
                                  color: 'white',
                                  border: 'none',
                                  padding: '6px 12px',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: '500'
                                }}
                              >
                                Tamam
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              setEditingSectionIndex(index);
                              setEditingSectionContent(section.content || '');
                            }}
                            style={{
                              padding: '12px',
                              background: '#f9fafb',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              minHeight: '60px',
                              border: '1px dashed #d1d5db'
                            }}
                            dangerouslySetInnerHTML={{
                              __html: section.content || '<p style="color: #9ca3af; margin: 0;">İçerik eklemek için tıklayın...</p>'
                            }}
                          />
                        )}
                      </div>
                    ) : section.type === 'card' ? (
                      <div style={{ padding: '16px' }}>
                        {(() => {
                          const cardIds = section.contentIds || (section.contentId ? [section.contentId] : []);
                          return (
                            <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch', flexWrap: 'wrap' }}>
                              {cardIds.map((cardId, cardIndex) => {
                                const cardContent = contents.find(c => c._id === cardId);
                                if (!cardContent) return null;
                                return (
                                  <div
                                    key={cardIndex}
                                    style={{
                                      flex: '0 0 auto',
                                      width: '200px',
                                      padding: '12px',
                                      background: '#f9fafb',
                                      borderRadius: '6px',
                                      border: '1px solid #e5e7eb',
                                      display: 'flex',
                                      flexDirection: 'column',
                                      gap: '8px',
                                      position: 'relative'
                                    }}
                                  >
                                    {cardContent.featuredImage || cardContent.metadata?.image ? (
                                      <img
                                        src={cardContent.featuredImage || cardContent.metadata?.image}
                                        alt={cardContent.title}
                                        style={{
                                          width: '100%',
                                          height: '120px',
                                          objectFit: 'cover',
                                          borderRadius: '4px'
                                        }}
                                      />
                                    ) : (
                                      <div style={{
                                        width: '100%',
                                        height: '120px',
                                        background: '#e5e7eb',
                                        borderRadius: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#9ca3af',
                                        fontSize: '12px'
                                      }}>
                                        Görsel Yok
                                      </div>
                                    )}
                                    <div style={{ flex: 1 }}>
                                      <p style={{ margin: 0, fontWeight: '600', color: '#1f2937', fontSize: '13px', lineHeight: '1.3' }}>
                                        {cardContent.title}
                                      </p>
                                      {cardContent.description && (
                                        <p style={{ margin: '4px 0 0 0', color: '#6b7280', fontSize: '11px', lineHeight: '1.4', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                          {cardContent.description}
                                        </p>
                                      )}
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const updatedSections = [...formData.sections];
                                        const updatedCardIds = (updatedSections[index].contentIds || []).filter(id => id !== cardId);
                                        if (updatedCardIds.length === 0) {
                                          updatedSections[index].contentIds = [];
                                        } else {
                                          updatedSections[index].contentIds = updatedCardIds;
                                        }
                                        setFormData({ ...formData, sections: updatedSections });
                                      }}
                                      style={{
                                        position: 'absolute',
                                        top: '8px',
                                        right: '8px',
                                        background: 'rgba(239, 68, 68, 0.9)',
                                        border: 'none',
                                        width: '24px',
                                        height: '24px',
                                        borderRadius: '50%',
                                        cursor: 'pointer',
                                        fontSize: '14px',
                                        color: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: 'bold',
                                        transition: 'all 0.15s'
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background = '#dc2626';
                                        e.currentTarget.style.transform = 'scale(1.1)';
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)';
                                        e.currentTarget.style.transform = 'scale(1)';
                                      }}
                                      title="Kartı Kaldır"
                                    >
                                      ×
                                    </button>
                                  </div>
                                );
                              })}
                              <button
                                type="button"
                                onClick={() => {
                                  setShowCardSelectModal(true);
                                  setTempSectionIndex(index);
                                  // Mevcut seçili kartları yükle
                                  const currentIds = section.contentIds || (section.contentId ? [section.contentId] : []);
                                  setSelectedCardIds(new Set(currentIds));
                                }}
                                style={{
                                  flex: '0 0 auto',
                                  width: '200px',
                                  minHeight: '200px',
                                  padding: '1rem',
                                  background: '#f9fafb',
                                  border: '2px dashed #d1d5db',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  color: '#6b7280',
                                  fontSize: '14px',
                                  transition: 'all 0.15s',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '8px'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = '#9ca3af';
                                  e.currentTarget.style.background = '#f3f4f6';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = '#d1d5db';
                                  e.currentTarget.style.background = '#f9fafb';
                                }}
                              >
                                <span style={{ fontSize: '32px' }}>+</span>
                                <span style={{ fontWeight: '500' }}>Kart Ekle</span>
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    ) : section.type === 'component' ? (
                      <div style={{ padding: '16px' }}>
                        <div style={{ marginBottom: '12px' }}>
                          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                            Component Seçin
                          </label>
                          <ComponentSelector
                            value={section.componentId || ''}
                            onChange={(componentId) => {
                              const updatedSections = [...formData.sections];
                              updatedSections[index].componentId = componentId;
                              setFormData({ ...formData, sections: updatedSections });
                            }}
                          />
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Link Seçim Modal */}
      <Modal
        isOpen={showLinkModal}
        onClose={() => {
          setShowLinkModal(false);
          setLinkSearchTerm('');
        }}
        title="Menü Linki Seç"
        size="large"
      >
        <div>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              value={linkSearchTerm}
              onChange={(e) => setLinkSearchTerm(e.target.value)}
              placeholder="Link veya menü adı ile ara..."
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                background: '#ffffff'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
          </div>
          <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {filteredLinks.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280', fontSize: '14px' }}>
                {linkSearchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz menü linki eklenmemiş.'}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                {filteredLinks.map((link, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      // href'den slug çıkar
                      const slug = hrefToSlug(link.href);
                      setFormData({ ...formData, slug: slug });
                      setShowLinkModal(false);
                      setLinkSearchTerm('');
                    }}
                    style={{
                      padding: '16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {/* Görsel */}
                    {link.imageUrl ? (
                      <div style={{
                        width: '100%',
                        height: '120px',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        background: '#f3f4f6',
                        flexShrink: 0
                      }}>
                        <img
                          src={link.imageUrl}
                          alt={link.label}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).parentElement!.innerHTML = '<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 12px;">Görsel Yok</div>';
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '120px',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <div style={{
                          width: '48px',
                          height: '48px',
                          borderRadius: '50%',
                          background: '#f3f4f6',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          color: '#6b7280',
                          fontWeight: '500'
                        }}>
                          Link
                        </div>
                      </div>
                    )}
                    
                    {/* İçerik */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{
                        fontWeight: '600',
                        color: '#1f2937',
                        fontSize: '15px',
                        lineHeight: '1.3',
                        marginBottom: '2px'
                      }}>
                        {link.label}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        fontFamily: 'monospace',
                        background: '#f9fafb',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        wordBreak: 'break-all'
                      }}>
                        {link.href}
                      </div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '4px',
                        paddingTop: '8px',
                        borderTop: '1px solid #f3f4f6'
                      }}>
                        <span style={{
                          fontSize: '11px',
                          color: '#9ca3af',
                          background: '#f3f4f6',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: '500'
                        }}>
                          {link.menuName}
                        </span>
                        <span style={{
                          fontSize: '11px',
                          color: '#10b981',
                          fontWeight: '500'
                        }}>
                          ✓ Seç
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Kart İçerik Seçim Modal */}
      <Modal
        isOpen={showCardSelectModal}
        onClose={() => {
          setShowCardSelectModal(false);
          setTempSectionIndex(null);
          setSelectedCardIds(new Set());
          setCardModalCategoryFilter('all');
        }}
        title="Kart İçerikleri Seç"
        size="large"
        footer={
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => {
                setShowCardSelectModal(false);
                setTempSectionIndex(null);
                setSelectedCardIds(new Set());
              }}
              style={{
                background: '#f3f4f6',
                color: '#1f2937',
                border: '1px solid #e5e7eb',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e5e7eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
              }}
            >
              İptal
            </button>
            <button
              type="button"
              onClick={confirmCardSelection}
              disabled={selectedCardIds.size === 0}
              style={{
                background: selectedCardIds.size === 0 ? '#9ca3af' : '#1f2937',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: selectedCardIds.size === 0 ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'all 0.15s'
              }}
              onMouseEnter={(e) => {
                if (selectedCardIds.size > 0) {
                  e.currentTarget.style.background = '#374151';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCardIds.size > 0) {
                  e.currentTarget.style.background = '#1f2937';
                }
              }}
            >
              Seç ({selectedCardIds.size})
            </button>
          </div>
        }
      >
        <div style={{ marginBottom: '16px' }}>
          <Select
            label="Kategoriye Göre Filtrele"
            value={cardModalCategoryFilter}
            onChange={(e) => {
              setCardModalCategoryFilter(e.target.value);
              setSelectedCardIds(new Set()); // Filtre değiştiğinde seçimleri temizle
            }}
            options={[
              { value: 'all', label: 'Tüm Kategoriler' },
              { value: 'none', label: 'Kategorisiz' },
              ...categories.map(cat => ({ value: cat._id, label: cat.name }))
            ]}
          />
        </div>

        {/* Hızlı Seçim Butonları */}
        {cardModalCategoryFilter !== 'all' && cardModalCategoryFilter !== 'none' && (() => {
          const selectedCategory = categories.find(cat => cat._id === cardModalCategoryFilter);
          const categoryContents = contents.filter(c => {
            if (c._id === editingContent?._id) return false;
            if (!c.isActive) return false;
            return c.categoryId === cardModalCategoryFilter;
          }).sort((a, b) => {
            // En yeni içerikler önce (createdAt'e göre)
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });

          if (categoryContents.length === 0) return null;

          return (
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              background: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{
                fontSize: '13px',
                fontWeight: '500',
                color: '#1f2937',
                marginBottom: '8px'
              }}>
                ⚡ Hızlı Seçim
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[3, 5, 10, 15, 20].map((limit) => {
                  const limitedContents = categoryContents.slice(0, limit);
                  return (
                    <button
                      key={limit}
                      type="button"
                      onClick={() => {
                        const ids = new Set(limitedContents.map(c => c._id));
                        setSelectedCardIds(ids);
                      }}
                      style={{
                        padding: '6px 12px',
                        background: '#ffffff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#1f2937',
                        transition: 'all 0.15s',
                        whiteSpace: 'nowrap'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#1f2937';
                        e.currentTarget.style.background = '#f3f4f6';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#e5e7eb';
                        e.currentTarget.style.background = '#ffffff';
                      }}
                    >
                      Son {limit} Kart
                    </button>
                  );
                })}
                <button
                  type="button"
                  onClick={() => {
                    const ids = new Set(categoryContents.map(c => c._id));
                    setSelectedCardIds(ids);
                  }}
                  style={{
                    padding: '6px 12px',
                    background: '#ffffff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    color: '#1f2937',
                    transition: 'all 0.15s',
                    whiteSpace: 'nowrap'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#1f2937';
                    e.currentTarget.style.background = '#f3f4f6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.background = '#ffffff';
                  }}
                >
                  Tümünü Seç ({categoryContents.length})
                </button>
              </div>
              {selectedCategory?.autoAddContent && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px',
                  background: '#e0f2fe',
                  borderRadius: '4px',
                  fontSize: '11px',
                  color: '#0369a1'
                }}>
                  💡 Bu kategoride otomatik içerik ekleme aktif. Yeni içerikler otomatik olarak eklenir.
                </div>
              )}
            </div>
          );
        })()}

        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {(() => {
            const availableContents = contents.filter(c => {
              if (c._id === editingContent?._id) return false;
              if (!c.isActive) return false;
              if (cardModalCategoryFilter === 'all') return true;
              if (cardModalCategoryFilter === 'none') return !c.categoryId;
              return c.categoryId === cardModalCategoryFilter;
            }).sort((a, b) => {
              // En yeni içerikler önce
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            });

            return availableContents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280', fontSize: '14px' }}>
                {cardModalCategoryFilter !== 'all' 
                  ? 'Bu kategoriye ait içerik bulunamadı.' 
                  : 'Kart olarak eklenebilecek başka içerik bulunmuyor.'}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {availableContents.map((content) => {
                  const category = categories.find(cat => cat._id === content.categoryId);
                  const isSelected = selectedCardIds.has(content._id);
                  return (
                    <div
                      key={content._id}
                      onClick={() => toggleCardSelection(content._id)}
                      style={{
                        padding: '16px',
                        border: isSelected ? '2px solid #1f2937' : '1px solid #e5e7eb',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                        background: isSelected ? '#f3f4f6' : '#ffffff',
                        display: 'flex',
                        gap: '16px',
                        alignItems: 'center',
                        position: 'relative'
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#9ca3af';
                          e.currentTarget.style.background = '#f9fafb';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.borderColor = '#e5e7eb';
                          e.currentTarget.style.background = '#ffffff';
                        }
                      }}
                    >
                      <div style={{
                        width: '24px',
                        height: '24px',
                        border: '2px solid #1f2937',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: isSelected ? '#1f2937' : 'transparent',
                        flexShrink: 0
                      }}>
                        {isSelected && (
                          <span style={{ color: 'white', fontSize: '14px', fontWeight: 'bold' }}>✓</span>
                        )}
                      </div>
                      {(content.featuredImage || content.metadata?.image) && (
                        <img
                          src={content.featuredImage || content.metadata?.image}
                          alt={content.title}
                          style={{
                            width: '100px',
                            height: '75px',
                            objectFit: 'cover',
                            borderRadius: '4px',
                            flexShrink: 0
                          }}
                        />
                      )}
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                          {content.title}
                        </h3>
                        {content.description && (
                          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>
                            {content.description}
                          </p>
                        )}
                        <div style={{ display: 'flex', gap: '12px', marginTop: '4px', flexWrap: 'wrap' }}>
                          <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>
                            Slug: {content.slug}
                          </p>
                          {category && (
                            <p style={{ margin: 0, fontSize: '12px', color: '#6366f1', fontWeight: '500' }}>
                              {category.name}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </Modal>

      {/* Medya Seçim Modal */}
      <Modal
        isOpen={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        title="Görsel Seç"
        size="large"
      >
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {mediaFiles.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px', color: '#6b7280', fontSize: '14px' }}>
              Henüz görsel yüklenmemiş. Medya Yönetimi sayfasından görsel yükleyebilirsiniz.
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
              gap: '16px'
            }}>
              {mediaFiles.map((file) => (
                <div
                  key={file._id}
                  onClick={() => {
                    setFormData({ ...formData, featuredImage: file.url });
                    setShowMediaModal(false);
                  }}
                  style={{
                    cursor: 'pointer',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    transition: 'all 0.15s',
                    background: '#ffffff'
                  }}
                >
                  <img
                    src={file.url}
                    alt={file.originalName}
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ padding: '8px' }}>
                    <p style={{
                      fontSize: '12px',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: '#1f2937'
                    }}>
                      {file.originalName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

          {(() => {
            // Kategori filtresine göre içerikleri filtrele
            const filteredContents = contents.filter((content) => {
              if (selectedCategoryFilter === 'all') return true;
              if (selectedCategoryFilter === 'none') return !content.categoryId;
              return content.categoryId === selectedCategoryFilter;
            });

            return filteredContents.length === 0 ? (
        <div style={{
          background: '#ffffff',
          padding: '48px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Henüz içerik eklenmemiş.</p>
          <Button
            onClick={openNewContentModal}
            variant="primary"
            size="md"
            style={{ marginTop: '16px' }}
          >
            İlk İçeriği Ekle
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredContents.map((content) => {
            const category = categories.find(cat => cat._id === content.categoryId);
            return (
            <div key={content._id} style={{
              background: '#ffffff',
              padding: '20px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
            }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: expandedContents.has(content._id) ? '16px' : '0' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>{content.title}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', color: '#6b7280', fontSize: '13px', marginBottom: '8px' }}>
                    <span>Slug: <strong>{content.slug}</strong></span>
                    {category && (
                      <span>Kategori: <strong style={{ color: '#6366f1' }}>{category.name}</strong></span>
                    )}
                    <span>Durum: <strong style={{ color: content.isActive ? '#10b981' : '#ef4444' }}>{content.isActive ? 'Aktif' : 'Pasif'}</strong></span>
                    {content.createdAt && (
                      <span>
                        Oluşturulma: <strong>{new Date(content.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</strong>
                      </span>
                    )}
                    {content.updatedAt && (
                      <span>
                        Güncelleme: <strong>{new Date(content.updatedAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}</strong>
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', marginLeft: '16px', alignItems: 'center' }}>
                  <button
                    onClick={() => toggleContentDetails(content._id)}
                    style={{
                      background: '#f3f4f6',
                      color: '#1f2937',
                      border: '1px solid #e5e7eb',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '13px',
                      transition: 'all 0.15s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e5e7eb';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f3f4f6';
                    }}
                  >
                    <span style={{
                      transform: expandedContents.has(content._id) ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s',
                      display: 'inline-block'
                    }}>
                      ▼
                    </span>
                    {expandedContents.has(content._id) ? 'Detayları Gizle' : 'Detayları Göster'}
                  </button>
                  <Button
                    onClick={() => handleEdit(content)}
                    variant="primary"
                    size="sm"
                  >
                    Düzenle
                  </Button>
                  <Button
                    onClick={() => handleDelete(content._id)}
                    variant="danger"
                    size="sm"
                  >
                    Sil
                  </Button>
                </div>
              </div>

              {expandedContents.has(content._id) && (
                <div style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px solid #e5e7eb',
                  animation: 'fadeIn 0.2s ease-in'
                }}>
                  <style>{`
                    @keyframes fadeIn {
                      from {
                        opacity: 0;
                        transform: translateY(-10px);
                      }
                      to {
                        opacity: 1;
                        transform: translateY(0);
                      }
                    }
                  `}</style>
                  {content.description && (
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{
                        color: '#6b7280',
                        fontSize: '14px',
                        lineHeight: '1.6',
                        margin: 0
                      }}>
                        <strong style={{ color: '#1f2937' }}>Açıklama:</strong> {content.description}
                      </p>
                    </div>
                  )}
                  {(content.featuredImage || content.metadata?.image) && (
                    <div style={{ marginBottom: '16px' }}>
                      <p style={{
                        color: '#1f2937',
                        fontSize: '14px',
                        fontWeight: '500',
                        marginBottom: '8px'
                      }}>
                        Öne Çıkan Görsel:
                      </p>
                      <img
                        src={content.featuredImage || content.metadata?.image}
                        alt={content.title}
                        style={{
                          width: '100%',
                          maxHeight: '400px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                          border: '1px solid #e5e7eb'
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div style={{
                    background: '#ffffff',
                    padding: '24px',
                    borderRadius: '6px',
                    border: '1px solid #e5e7eb',
                    minHeight: '100px'
                  }}>
                    <p style={{
                      color: '#1f2937',
                      fontSize: '14px',
                      fontWeight: '500',
                      marginBottom: '12px'
                    }}>
                      İçerik Önizlemesi:
                    </p>
                    <div
                      className="content-preview"
                      style={{
                        color: '#374151',
                        fontSize: '15px',
                        lineHeight: '1.8',
                        wordBreak: 'break-word'
                      }}
                      dangerouslySetInnerHTML={{
                        __html: content.content.length > 500
                          ? content.content.substring(0, 500) + '<p style="color: #9ca3af; margin-top: 16px; font-style: italic;">... (devamı için düzenleyin)</p>'
                          : content.content
                      }}
                    />
                    <style>{`
                  .content-preview h1, .content-preview h2, .content-preview h3, 
                  .content-preview h4, .content-preview h5, .content-preview h6 {
                    margin: 16px 0 8px 0;
                    color: #1f2937;
                    font-weight: 600;
                  }
                  .content-preview p {
                    margin: 12px 0;
                  }
                  .content-preview ul, .content-preview ol {
                    margin: 12px 0;
                    padding-left: 24px;
                  }
                  .content-preview li {
                    margin: 6px 0;
                  }
                  .content-preview table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 16px 0;
                  }
                  .content-preview table th,
                  .content-preview table td {
                    border: 1px solid #e5e7eb;
                    padding: 8px 12px;
                    text-align: left;
                  }
                  .content-preview table th {
                    background: #f3f4f6;
                    font-weight: 600;
                  }
                  .content-preview img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 6px;
                    margin: 16px 0;
                  }
                  .content-preview blockquote {
                    border-left: 4px solid #1f2937;
                    padding-left: 16px;
                    margin: 16px 0;
                    color: #6b7280;
                    font-style: italic;
                  }
                  .content-preview code {
                    background: #f3f4f6;
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: monospace;
                    font-size: 0.9em;
                  }
                  .content-preview pre {
                    background: #f3f4f6;
                    padding: 16px;
                    border-radius: 6px;
                    overflow-x: auto;
                    margin: 16px 0;
                  }
                  .content-preview pre code {
                    background: none;
                    padding: 0;
                  }
                `}</style>
                  </div>
                </div>
              )}
            </div>
              );
            })}
          </div>
        );
        })()}
        </div>
      </div>

    </div>
  );
}

// Component Selector Component
function ComponentSelector({ value, onChange }: { value: string; onChange: (componentId: string) => void }) {
  const [components, setComponents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getComponents(undefined, true);
      setComponents(response.components || []);
    } catch (error) {
      console.error('Componentler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: '100%',
        padding: '8px 12px',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        fontSize: '14px',
        background: '#ffffff',
        color: '#1f2937',
      }}
    >
      <option value="">Component Seçiniz</option>
      {loading ? (
        <option disabled>Yükleniyor...</option>
      ) : (
        components.map((comp) => (
          <option key={comp._id} value={comp._id}>
            {comp.name} ({comp.type})
          </option>
        ))
      )}
    </select>
  );
}
