'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import Modal from '@/components/Modal';
import LoadingScreen from '@/components/LoadingScreen';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// React Quill'i dynamic import ile yükle (SSR sorunlarını önlemek için)
const ReactQuill = dynamic(() => import('react-quill-new').then(mod => ({ default: mod.default })), { ssr: false }) as any;

interface Content {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  content: string;
  type: 'page';
  isActive: boolean;
  order?: number;
  featuredImage?: string;
  metadata?: {
    image?: string;
    keywords?: string[];
    [key: string]: any;
  };
}


export default function ContentManagement() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    slug: '',
    title: '',
    description: '',
    content: '',
    type: 'page' as Content['type'],
    isActive: true,
    order: 0,
    featuredImage: '',
  });
  const [quillInstance, setQuillInstance] = useState<any>(null);
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [expandedContents, setExpandedContents] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadContents();
    loadMedia();
  }, []);

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
      const submitData = {
        ...formData,
        metadata: {
          image: formData.featuredImage,
        }
      };
      if (editingContent) {
        await apiClient.updateContent(editingContent._id, submitData);
      } else {
        await apiClient.createContent(submitData);
      }
      setShowModal(false);
      setEditingContent(null);
      setFormData({
        slug: '',
        title: '',
        description: '',
        content: '',
        type: 'page',
        isActive: true,
        order: 0,
        featuredImage: '',
      });
      await loadContents();
    } catch (error: any) {
      alert(error.message || 'Bir hata oluştu');
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
      type: content.type,
      isActive: content.isActive,
      order: content.order || 0,
      featuredImage: content.featuredImage || content.metadata?.image || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu içeriği silmek istediğinize emin misiniz?')) return;
    try {
      await apiClient.deleteContent(id);
      await loadContents();
    } catch (error: any) {
      alert(error.message || 'Bir hata oluştu');
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
      type: 'page',
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
    setFormData({
      slug: '',
      title: '',
      description: '',
      content: '',
      type: 'page',
      isActive: true,
      order: 0,
      featuredImage: '',
    });
  };

  // Tablo ekleme fonksiyonu
  const insertTable = (rows: number = 3, cols: number = 3) => {
    if (quillInstance) {
      const range = quillInstance.getSelection();
      const index = range ? range.index : quillInstance.getLength();
      
      let tableHTML = '<table style="border-collapse: collapse; width: 100%; margin: 20px 0; border: 1px solid #e5e7eb;"><tbody>';
      for (let i = 0; i < rows; i++) {
        tableHTML += '<tr>';
        for (let j = 0; j < cols; j++) {
          const isHeader = i === 0;
          const tag = isHeader ? 'th' : 'td';
          tableHTML += `<${tag} style="border: 1px solid #e5e7eb; padding: 12px; ${isHeader ? 'background: #f3f4f6; font-weight: 600;' : ''}">&nbsp;</${tag}>`;
        }
        tableHTML += '</tr>';
      }
      tableHTML += '</tbody></table>';
      
      quillInstance.clipboard.dangerouslyPasteHTML(index, tableHTML);
    }
  };

  // Tarihçe ekleme fonksiyonu
  const insertTimeline = () => {
    if (quillInstance) {
      const range = quillInstance.getSelection();
      const index = range ? range.index : quillInstance.getLength();
      
      const timelineHTML = `
        <div style="margin: 30px 0; padding: 20px; background: #f9fafb; border-radius: 8px; border-left: 4px solid #1f2937;">
          <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 20px; font-weight: 600;">Tarihçe</h3>
          <div style="position: relative; padding-left: 30px;">
            <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 2px; background: #d1d5db;"></div>
            <div style="margin-bottom: 30px; position: relative;">
              <div style="position: absolute; left: -25px; top: 5px; width: 12px; height: 12px; border-radius: 50%; background: #1f2937; border: 3px solid #f9fafb;"></div>
              <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px;">Yıl</div>
              <div style="color: #6b7280; line-height: 1.6;">Açıklama buraya gelecek...</div>
            </div>
            <div style="margin-bottom: 30px; position: relative;">
              <div style="position: absolute; left: -25px; top: 5px; width: 12px; height: 12px; border-radius: 50%; background: #1f2937; border: 3px solid #f9fafb;"></div>
              <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px;">Yıl</div>
              <div style="color: #6b7280; line-height: 1.6;">Açıklama buraya gelecek...</div>
            </div>
            <div style="margin-bottom: 0; position: relative;">
              <div style="position: absolute; left: -25px; top: 5px; width: 12px; height: 12px; border-radius: 50%; background: #1f2937; border: 3px solid #f9fafb;"></div>
              <div style="font-weight: 600; color: #1f2937; margin-bottom: 8px;">Yıl</div>
              <div style="color: #6b7280; line-height: 1.6;">Açıklama buraya gelecek...</div>
            </div>
          </div>
        </div>
      `;
      
      quillInstance.clipboard.dangerouslyPasteHTML(index, timelineHTML);
    }
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
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
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
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h1 style={{ fontSize: '24px', color: '#1f2937', fontWeight: '600', margin: 0, letterSpacing: '-0.5px' }}>İçerik Yönetimi</h1>
        <button
          onClick={openNewContentModal}
          style={{
            background: '#1f2937',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#374151';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#1f2937';
          }}
        >
          + Yeni İçerik
        </button>
      </div>

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingContent ? 'İçerik Düzenle' : 'Yeni İçerik Ekle'}
        size="xlarge"
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={closeModal}
              disabled={submitting}
              style={{
                background: '#f3f4f6',
                color: '#1f2937',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'all 0.15s',
                opacity: submitting ? 0.6 : 1
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.background = '#e5e7eb';
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.currentTarget.style.background = '#f3f4f6';
                }
              }}
            >
              İptal
            </button>
            <button
              type="submit"
              form="content-form"
              disabled={submitting}
              style={{
                background: submitting ? '#9ca3af' : '#1f2937',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  e.currentTarget.style.background = '#374151';
                }
              }}
              onMouseLeave={(e) => {
                if (!submitting) {
                  e.currentTarget.style.background = '#1f2937';
                }
              }}
            >
              {submitting ? 'Kaydediliyor...' : (editingContent ? 'Güncelle' : 'Oluştur')}
            </button>
          </div>
        }
      >
        <form id="content-form" onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                placeholder="ornek-slug"
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>Durum</label>
              <select
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                style={{ 
                  width: '100%', 
                  padding: '8px 12px', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  background: '#ffffff'
                }}
              >
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>Başlık</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="İçerik başlığı"
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '6px',
                fontSize: '14px',
                transition: 'border-color 0.15s',
                background: '#ffffff'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>Açıklama</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Kısa açıklama (opsiyonel)"
              style={{ 
                width: '100%', 
                padding: '8px 12px', 
                border: '1px solid #e5e7eb', 
                borderRadius: '6px',
                fontSize: '14px',
                transition: 'border-color 0.15s',
                background: '#ffffff'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>Öne Çıkan Görsel (Sayfa Başı)</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <input
                type="text"
                value={formData.featuredImage}
                onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                placeholder="/uploads/image.jpg veya URL"
                style={{ 
                  flex: 1,
                  padding: '8px 12px', 
                  border: '1px solid #e5e7eb', 
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
                <button
                  type="button"
                  onClick={() => {
                    loadMedia();
                    setShowMediaModal(true);
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
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e5e7eb';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#f3f4f6';
                }}
              >
                🖼️ Görsel Seç
              </button>
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

          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>İçerik</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    const rowsInput = prompt('Satır sayısı (örn: 3):', '3');
                    const colsInput = prompt('Sütun sayısı (örn: 3):', '3');
                    if (rowsInput && colsInput) {
                      const rows = parseInt(rowsInput) || 3;
                      const cols = parseInt(colsInput) || 3;
                      if (rows > 0 && rows <= 20 && cols > 0 && cols <= 20) {
                        insertTable(rows, cols);
                      } else {
                        alert('Satır ve sütun sayısı 1-20 arasında olmalıdır.');
                      }
                    }
                  }}
                  style={{
                    background: '#f3f4f6',
                    color: '#1f2937',
                    border: '1px solid #e5e7eb',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '13px',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                  }}
                >
                  📊 Tablo Ekle
                </button>
                <button
                  type="button"
                  onClick={insertTimeline}
                  style={{
                    background: '#f3f4f6',
                    color: '#1f2937',
                    border: '1px solid #e5e7eb',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: '500',
                    fontSize: '13px',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#e5e7eb';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#f3f4f6';
                  }}
                >
                  📅 Tarihçe Ekle
                </button>
              </div>
            </div>
            <div style={{ 
              border: '1px solid #e5e7eb', 
              borderRadius: '6px',
              background: '#ffffff',
              overflow: 'hidden'
            }}>
              <style>{`
                .ql-container {
                  font-size: 14px;
                  min-height: 500px;
                }
                .ql-editor {
                  min-height: 500px;
                }
                .ql-toolbar {
                  border-top: none;
                  border-left: none;
                  border-right: none;
                  border-bottom: 1px solid #e5e7eb;
                  background: #f9fafb;
                }
                .ql-container {
                  border-bottom: none;
                  border-left: none;
                  border-right: none;
                  border-top: none;
                }
              `}</style>
              <ReactQuill
                theme="snow"
                value={formData.content}
                onChange={(value: string) => setFormData({ ...formData, content: value })}
                modules={modules}
                formats={formats}
                placeholder="İçeriğinizi buraya yazın..."
              />
            </div>
          </div>
        </form>
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
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#9ca3af';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
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

      {contents.length === 0 ? (
        <div style={{ 
          background: '#ffffff', 
          padding: '48px', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Henüz içerik eklenmemiş.</p>
          <button
            onClick={openNewContentModal}
            style={{
              marginTop: '16px',
              background: '#1f2937',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: '500',
              fontSize: '14px',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#1f2937';
            }}
          >
            İlk İçeriği Ekle
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {contents.map((content) => (
            <div key={content._id} style={{ 
              background: '#ffffff', 
              padding: '20px', 
              borderRadius: '8px', 
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'all 0.15s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#d1d5db';
              e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
            }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: expandedContents.has(content._id) ? '16px' : '0' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>{content.title}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', color: '#6b7280', fontSize: '13px', marginBottom: '8px' }}>
                    <span>Slug: <strong>{content.slug}</strong></span>
                    <span>Durum: <strong style={{ color: content.isActive ? '#10b981' : '#ef4444' }}>{content.isActive ? 'Aktif' : 'Pasif'}</strong></span>
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
                  <button
                    onClick={() => handleEdit(content)}
                    style={{
                      background: '#1f2937',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '13px',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#374151'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#1f2937'}
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(content._id)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '13px',
                      transition: 'background 0.15s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#dc2626'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#ef4444'}
                  >
                    Sil
                  </button>
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
          ))}
        </div>
      )}
    </div>
  );
}
