'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import Modal from '@/components/Modal';
import LoadingScreen from '@/components/LoadingScreen';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import ComponentRenderer from '@/components/ComponentRenderer';
import Swal from 'sweetalert2';

interface Component {
  _id: string;
  name: string;
  slug: string;
  type: 'hero' | 'news' | 'map' | 'custom' | 'card' | 'section';
  description?: string;
  html: string;
  css?: string;
  js?: string;
  isActive: boolean;
  order: number;
  categoryId?: string;
  settings?: {
    [key: string]: any;
  };
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export default function ComponentManagement() {
  const [components, setComponents] = useState<Component[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingComponent, setEditingComponent] = useState<Component | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | Component['type']>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'custom' as Component['type'],
    description: '',
    html: '',
    css: '',
    js: '',
    isActive: true,
    order: 0,
    categoryId: '',
  });
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    loadComponents();
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

  const loadComponents = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getComponents();
      setComponents(response.components || []);
    } catch (error) {
      console.error('Componentler yüklenemedi:', error);
      Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: 'Componentler yüklenirken bir hata oluştu',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const slug = formData.slug.trim() || createSlug(formData.name);

      const submitData = {
        ...formData,
        slug,
        categoryId: formData.categoryId || undefined,
      };

      let response;
      if (editingComponent) {
        response = await apiClient.updateComponent(editingComponent._id, submitData);
      } else {
        response = await apiClient.createComponent(submitData);
      }

      if (!response.success) {
        throw new Error(response.error || 'Kayıt başarısız oldu');
      }

      setShowModal(false);
      setEditingComponent(null);
      setFormData({
        name: '',
        slug: '',
        type: 'custom',
        description: '',
        html: '',
        css: '',
        js: '',
        isActive: true,
        order: 0,
        categoryId: '',
      });
      await loadComponents();
      await Swal.fire({
        icon: 'success',
        title: 'Başarılı!',
        text: editingComponent ? 'Component başarıyla güncellendi.' : 'Component başarıyla oluşturuldu.',
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

  const handleEdit = (component: Component) => {
    setEditingComponent(component);
    setFormData({
      name: component.name,
      slug: component.slug,
      type: component.type,
      description: component.description || '',
      html: component.html,
      css: component.css || '',
      js: component.js || '',
      isActive: component.isActive,
      order: component.order || 0,
      categoryId: component.categoryId || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: 'Emin misiniz?',
        text: 'Bu componenti silmek istediğinize emin misiniz?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc2626',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Evet, Sil!',
        cancelButtonText: 'İptal',
      });

      if (!result.isConfirmed) {
        return;
      }

      await apiClient.deleteComponent(id);
      await loadComponents();

      await Swal.fire({
        icon: 'success',
        title: 'Silindi!',
        text: 'Component başarıyla silindi.',
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

  const openNewComponentModal = () => {
    setEditingComponent(null);
    setFormData({
      name: '',
      slug: '',
      type: 'custom',
      description: '',
      html: '',
      css: '',
      js: '',
      isActive: true,
      order: 0,
      categoryId: '',
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingComponent(null);
    setFormData({
      name: '',
      slug: '',
      type: 'custom',
      description: '',
      html: '',
      css: '',
      js: '',
      isActive: true,
      order: 0,
      categoryId: '',
    });
  };

  const filteredComponents = components.filter((component) => {
    const matchesSearch =
      component.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      component.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (component.description && component.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = filterType === 'all' || component.type === filterType;

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && component.isActive) ||
      (filterStatus === 'inactive' && !component.isActive);

    return matchesSearch && matchesType && matchesStatus;
  });

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
        <h1 style={{ fontSize: '24px', color: '#1f2937', fontWeight: '600', margin: 0 }}>Component Yönetimi</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch', flexWrap: 'wrap', flex: '1', justifyContent: 'flex-end', minWidth: '300px' }}>
          <div style={{ flex: '1', minWidth: '250px', maxWidth: '400px' }}>
            <Input
              placeholder="Component ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            options={[
              { value: 'all', label: 'Tüm Tipler' },
              { value: 'hero', label: 'Hero' },
              { value: 'news', label: 'News' },
              { value: 'map', label: 'Map' },
              { value: 'custom', label: 'Custom' },
              { value: 'card', label: 'Card' },
              { value: 'section', label: 'Section' },
            ]}
            style={{ minWidth: '120px' }}
          />
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'active' | 'inactive')}
            options={[
              { value: 'all', label: 'Tümü' },
              { value: 'active', label: 'Aktif' },
              { value: 'inactive', label: 'Pasif' },
            ]}
            style={{ minWidth: '120px' }}
          />
          <Button variant="primary" size="md" onClick={openNewComponentModal} style={{ whiteSpace: 'nowrap' }}>
            + Yeni Component
          </Button>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingComponent ? 'Component Düzenle' : 'Yeni Component Ekle'}
        size="xlarge"
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Button 
              type="button" 
              onClick={() => setShowPreview(!showPreview)} 
              variant="secondary" 
              size="md"
            >
              {showPreview ? 'Önizlemeyi Gizle' : 'Önizleme'}
            </Button>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Button type="button" onClick={closeModal} variant="outline" size="md" disabled={submitting}>
                İptal
              </Button>
              <Button type="submit" form="component-form" variant="primary" size="md" isLoading={submitting}>
                {editingComponent ? 'Güncelle' : 'Oluştur'}
              </Button>
            </div>
          </div>
        }
      >
        <form id="component-form" onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <Input
              label="Component Adı"
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                setFormData({
                  ...formData,
                  name,
                  slug: formData.slug || createSlug(name),
                });
              }}
              required
              placeholder="Örn: Hero Banner, News Section"
            />
            <Input
              label="Slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: createSlug(e.target.value) })}
              required
              placeholder="Otomatik oluşturulur"
              helperText="URL'de kullanılacak benzersiz tanımlayıcı"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <Select
              label="Tip"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Component['type'] })}
              options={[
                { value: 'hero', label: 'Hero' },
                { value: 'news', label: 'News' },
                { value: 'map', label: 'Map' },
                { value: 'custom', label: 'Custom' },
                { value: 'card', label: 'Card' },
                { value: 'section', label: 'Section' },
              ]}
            />
            <Select
              label="Kategori"
              value={formData.categoryId || ''}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              options={[
                { value: '', label: 'Kategori Seçiniz' },
                ...categories.map(cat => ({ value: cat._id, label: cat.name }))
              ]}
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Select
                label="Durum"
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'active' })}
                options={[
                  { value: 'active', label: 'Aktif' },
                  { value: 'inactive', label: 'Pasif' },
                ]}
              />
              <Input
                label="Sıra"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <Input
              label="Açıklama"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Component hakkında kısa açıklama (opsiyonel)"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
              HTML <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              value={formData.html}
              onChange={(e) => setFormData({ ...formData, html: e.target.value })}
              required
              rows={12}
              placeholder="<div>Component HTML içeriği</div>"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'monospace',
                resize: 'vertical',
                background: '#ffffff',
                color: '#1f2937',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
              CSS
            </label>
            <textarea
              value={formData.css}
              onChange={(e) => setFormData({ ...formData, css: e.target.value })}
              rows={10}
              placeholder=".component { color: #000; }"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'monospace',
                resize: 'vertical',
                background: '#ffffff',
                color: '#1f2937',
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
              JavaScript
            </label>
            <textarea
              value={formData.js}
              onChange={(e) => setFormData({ ...formData, js: e.target.value })}
              rows={10}
              placeholder="console.log('Component loaded');"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'monospace',
                resize: 'vertical',
                background: '#ffffff',
                color: '#1f2937',
              }}
            />
          </div>

          {showPreview && (
            <div style={{ 
              marginTop: '24px', 
              padding: '20px', 
              border: '1px solid #e5e7eb', 
              borderRadius: '8px',
              background: '#ffffff'
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1f2937' }}>
                Önizleme
              </h3>
              <div style={{ 
                border: '1px solid #e5e7eb', 
                borderRadius: '6px', 
                padding: '20px',
                background: '#f9fafb',
                minHeight: '200px'
              }}>
                <ComponentRenderer
                  html={formData.html}
                  css={formData.css}
                  js={formData.js}
                  componentId={editingComponent?._id || 'preview'}
                />
              </div>
            </div>
          )}
        </form>
      </Modal>

      {filteredComponents.length === 0 ? (
        <div style={{
          background: '#ffffff',
          padding: '48px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'Arama kriterlerinize uygun component bulunamadı.'
              : 'Henüz component eklenmemiş.'}
          </p>
          <Button
            onClick={openNewComponentModal}
            variant="primary"
            size="md"
            style={{ marginTop: '16px' }}
          >
            İlk Componenti Ekle
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredComponents.map((component) => {
            const category = categories.find(cat => cat._id === component.categoryId);
            return (
              <div key={component._id} style={{
                background: '#ffffff',
                padding: '20px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>
                      {component.name}
                    </h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', color: '#6b7280', fontSize: '13px', marginBottom: '8px', alignItems: 'center' }}>
                      <span>Slug: <strong>{component.slug}</strong></span>
                      <span>Tip: <strong style={{ color: '#6366f1' }}>{component.type}</strong></span>
                      <span>Durum: <strong style={{ color: component.isActive ? '#10b981' : '#ef4444' }}>
                        {component.isActive ? 'Aktif' : 'Pasif'}
                      </strong></span>
                      <span>Sıra: <strong>{component.order || 0}</strong></span>
                      {category && (
                        <span>Kategori: <strong style={{ color: '#6366f1' }}>{category.name}</strong></span>
                      )}
                    </div>
                    {component.description && (
                      <p style={{ color: '#6b7280', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
                        {component.description}
                      </p>
                    )}
                    <div style={{ marginTop: '12px', padding: '12px', background: '#f9fafb', borderRadius: '6px', fontSize: '12px', color: '#6b7280' }}>
                      <div>HTML: {component.html.length} karakter</div>
                      <div>CSS: {component.css?.length || 0} karakter</div>
                      <div>JS: {component.js?.length || 0} karakter</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginLeft: '16px', alignItems: 'center' }}>
                    <Button
                      onClick={() => handleEdit(component)}
                      variant="primary"
                      size="sm"
                    >
                      Düzenle
                    </Button>
                    <Button
                      onClick={() => handleDelete(component._id)}
                      variant="danger"
                      size="sm"
                    >
                      Sil
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

