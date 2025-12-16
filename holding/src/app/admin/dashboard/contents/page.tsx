'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

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
  const [showForm, setShowForm] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
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
    try {
      if (editingContent) {
        await apiClient.updateContent(editingContent._id, formData);
      } else {
        await apiClient.createContent(formData);
      }
      setShowForm(false);
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
      loadContents();
    } catch (error: any) {
      alert(error.message || 'Bir hata oluştu');
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
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu içeriği silmek istediğinize emin misiniz?')) return;
    try {
      await apiClient.deleteContent(id);
      loadContents();
    } catch (error: any) {
      alert(error.message || 'Bir hata oluştu');
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#313131' }}>İçerik Yönetimi</h1>
        <button
          onClick={() => {
            setShowForm(true);
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
          }}
          style={{
            background: '#313131',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '5px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          + Yeni İçerik
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>{editingContent ? 'İçerik Düzenle' : 'Yeni İçerik'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Slug</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '5px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Tip</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '5px' }}
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

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Başlık</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '5px' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Açıklama</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '5px' }}
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>İçerik</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
                rows={10}
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '5px', fontFamily: 'inherit' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Aktif
                </label>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Sıra</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '5px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                type="submit"
                style={{
                  background: '#313131',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                {editingContent ? 'Güncelle' : 'Oluştur'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
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
                }}
                style={{
                  background: '#ccc',
                  color: '#333',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gap: '1rem' }}>
        {contents.map((content) => (
          <div key={content._id} style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{content.title}</h3>
                <p style={{ color: '#666' }}>
                  Slug: {content.slug} | Tip: {content.type} | Aktif: {content.isActive ? 'Evet' : 'Hayır'} | Sıra: {content.order || 0}
                </p>
                {content.description && (
                  <p style={{ marginTop: '0.5rem', color: '#888' }}>{content.description}</p>
                )}
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleEdit(content)}
                  style={{
                    background: '#313131',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Düzenle
                </button>
                <button
                  onClick={() => handleDelete(content._id)}
                  style={{
                    background: '#c33',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  Sil
                </button>
              </div>
            </div>
            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '5px', maxHeight: '200px', overflow: 'auto' }}>
              <div dangerouslySetInnerHTML={{ __html: content.content.substring(0, 200) + '...' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
