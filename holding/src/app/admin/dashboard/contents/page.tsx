'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import Modal from '@/components/Modal';
import LoadingScreen from '@/components/LoadingScreen';

interface Content {
  _id: string;
  slug: string;
  title: string;
  description?: string;
  content: string;
  type: 'page' | 'section' | 'hero' | 'about' | 'service' | 'news' | 'footer';
  isActive: boolean;
  order?: number;
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
    type: 'section' as Content['type'],
    isActive: true,
    order: 0,
  });

  useEffect(() => {
    loadContents();
  }, []);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingContent) {
        await apiClient.updateContent(editingContent._id, formData);
      } else {
        await apiClient.createContent(formData);
      }
      // Başarılı olduğunda modal'ı kapat ve sayfayı yenile
      setShowModal(false);
      setEditingContent(null);
      setFormData({
        slug: '',
        title: '',
        description: '',
        content: '',
        type: 'section',
        isActive: true,
        order: 0,
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

  const openNewContentModal = () => {
    setEditingContent(null);
    setFormData({
      slug: '',
      title: '',
      description: '',
      content: '',
      type: 'section',
      isActive: true,
      order: 0,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingContent(null);
    setFormData({
      slug: '',
      title: '',
      description: '',
      content: '',
      type: 'section',
      isActive: true,
      order: 0,
    });
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
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #e2e8f0'
      }}>
        <h1 style={{ fontSize: '2rem', color: '#313131', fontWeight: '700', margin: 0 }}>İçerik Yönetimi</h1>
        <button
          onClick={openNewContentModal}
          style={{
            background: 'linear-gradient(135deg, #313131 0%, #414141 100%)',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.3s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
          }}
        >
          + Yeni İçerik
        </button>
      </div>

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingContent ? 'İçerik Düzenle' : 'Yeni İçerik Ekle'}
        size="large"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#313131' }}>Slug</label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                required
                placeholder="ornek-slug"
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '2px solid #e2e8f0', 
                  borderRadius: '8px',
                  fontSize: '1rem',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#313131'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#313131' }}>Tip</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '2px solid #e2e8f0', 
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                <option value="page">Sayfa</option>
                <option value="section">Bölüm</option>
                <option value="hero">Hero</option>
                <option value="about">Hakkımızda</option>
                <option value="service">Hizmet</option>
                <option value="news">Haber</option>
                <option value="footer">Footer</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#313131' }}>Başlık</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="İçerik başlığı"
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                border: '2px solid #e2e8f0', 
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#313131'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#313131' }}>Açıklama</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Kısa açıklama (opsiyonel)"
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                border: '2px solid #e2e8f0', 
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#313131'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#313131' }}>İçerik</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
              rows={12}
              placeholder="İçerik metni..."
              style={{ 
                width: '100%', 
                padding: '0.75rem', 
                border: '2px solid #e2e8f0', 
                borderRadius: '8px', 
                fontFamily: 'inherit',
                fontSize: '1rem',
                resize: 'vertical',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#313131'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: '600', color: '#313131' }}>Aktif</span>
              </label>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#313131' }}>Sıra</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                style={{ 
                  width: '100%', 
                  padding: '0.75rem', 
                  border: '2px solid #e2e8f0', 
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
            <button
              type="button"
              onClick={closeModal}
              disabled={submitting}
              style={{
                background: '#e2e8f0',
                color: '#313131',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                opacity: submitting ? 0.6 : 1
              }}
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: 'linear-gradient(135deg, #313131 0%, #414141 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: submitting ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                opacity: submitting ? 0.6 : 1
              }}
            >
              {submitting ? 'Kaydediliyor...' : (editingContent ? 'Güncelle' : 'Oluştur')}
            </button>
          </div>
        </form>
      </Modal>

      {contents.length === 0 ? (
        <div style={{ 
          background: 'white', 
          padding: '3rem', 
          borderRadius: '12px', 
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>Henüz içerik eklenmemiş.</p>
          <button
            onClick={openNewContentModal}
            style={{
              marginTop: '1rem',
              background: 'linear-gradient(135deg, #313131 0%, #414141 100%)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            İlk İçeriği Ekle
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {contents.map((content) => (
            <div key={content._id} style={{ 
              background: 'white', 
              padding: '1.5rem', 
              borderRadius: '12px', 
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              transition: 'transform 0.2s, box-shadow 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
            }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: '600', color: '#313131' }}>{content.title}</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <span>Slug: <strong>{content.slug}</strong></span>
                    <span>Tip: <strong>{content.type}</strong></span>
                    <span>Durum: <strong style={{ color: content.isActive ? '#10b981' : '#ef4444' }}>{content.isActive ? 'Aktif' : 'Pasif'}</strong></span>
                    <span>Sıra: <strong>{content.order || 0}</strong></span>
                  </div>
                  {content.description && (
                    <p style={{ marginTop: '0.5rem', color: '#888', fontSize: '0.95rem' }}>{content.description}</p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                  <button
                    onClick={() => handleEdit(content)}
                    style={{
                      background: '#313131',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '0.9rem',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#414141'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#313131'}
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(content._id)}
                    style={{
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: '500',
                      fontSize: '0.9rem',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#b91c1c'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#dc2626'}
                  >
                    Sil
                  </button>
                </div>
              </div>
              <div style={{ 
                background: '#f8fafc', 
                padding: '1rem', 
                borderRadius: '8px', 
                maxHeight: '200px', 
                overflow: 'auto',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ color: '#666', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  {content.content.length > 200 ? content.content.substring(0, 200) + '...' : content.content}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
