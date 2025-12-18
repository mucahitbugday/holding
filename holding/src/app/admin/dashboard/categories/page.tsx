'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import Modal from '@/components/Modal';
import LoadingScreen from '@/components/LoadingScreen';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Swal from 'sweetalert2';

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  order?: number;
  autoAddContent?: boolean;
  autoAddLimit?: number;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export default function CategoryManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [contentCounts, setContentCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true,
    order: 0,
    autoAddContent: false,
    autoAddLimit: 5,
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCategories();
      const categoriesList = response.categories || [];
      setCategories(categoriesList);
      
      // Her kategori için içerik sayısını al
      const counts: Record<string, number> = {};
      for (const category of categoriesList) {
        try {
          const contentsResponse = await apiClient.getContents(undefined, undefined, category._id);
          counts[category._id] = contentsResponse.contents?.length || 0;
        } catch (error) {
          counts[category._id] = 0;
        }
      }
      setContentCounts(counts);
    } catch (error) {
      console.error('Kategoriler yüklenemedi:', error);
      Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: 'Kategoriler yüklenirken bir hata oluştu',
      });
    } finally {
      setLoading(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Slug oluştur (eğer boşsa)
      const slug = formData.slug.trim() || createSlug(formData.name);

      const submitData = {
        ...formData,
        slug,
      };

      let response;
      if (editingCategory) {
        response = await apiClient.updateCategory(editingCategory._id, submitData);
      } else {
        response = await apiClient.createCategory(submitData);
      }

      if (!response.success) {
        throw new Error(response.error || 'Kayıt başarısız oldu');
      }

      setShowModal(false);
      setEditingCategory(null);
      setFormData({
        name: '',
        slug: '',
        description: '',
        isActive: true,
        order: 0,
        autoAddContent: false,
        autoAddLimit: 5,
      });
      await loadCategories();
      await Swal.fire({
        icon: 'success',
        title: 'Başarılı!',
        text: editingCategory ? 'Kategori başarıyla güncellendi.' : 'Kategori başarıyla oluşturuldu.',
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

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || '',
      isActive: category.isActive,
      order: category.order || 0,
      autoAddContent: category.autoAddContent || false,
      autoAddLimit: category.autoAddLimit || 5,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const result = await Swal.fire({
        title: 'Emin misiniz?',
        text: 'Bu kategoriyi silmek istediğinize emin misiniz? Bu kategoriye ait içerikler etkilenebilir.',
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

      await apiClient.deleteCategory(id);
      await loadCategories();

      await Swal.fire({
        icon: 'success',
        title: 'Silindi!',
        text: 'Kategori başarıyla silindi.',
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

  const openNewCategoryModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      isActive: true,
      order: 0,
      autoAddContent: false,
      autoAddLimit: 5,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      isActive: true,
      order: 0,
      autoAddContent: false,
      autoAddLimit: 5,
    });
  };

  // Filtreleme
  const filteredCategories = categories.filter((category) => {
    const matchesSearch = 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = 
      filterStatus === 'all' ||
      (filterStatus === 'active' && category.isActive) ||
      (filterStatus === 'inactive' && !category.isActive);

    return matchesSearch && matchesStatus;
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
        <h1 style={{ fontSize: '24px', color: '#1f2937', fontWeight: '600', margin: 0, letterSpacing: '-0.5px' }}>Kategori Yönetimi</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch', flexWrap: 'wrap', flex: '1', justifyContent: 'flex-end', minWidth: '300px' }}>
          <div style={{ flex: '1', minWidth: '250px', maxWidth: '400px' }}>
            <Input
              placeholder="Kategori ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
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
          <Button variant="primary" size="md" onClick={openNewCategoryModal} style={{ whiteSpace: 'nowrap' }}>
            + Yeni Kategori
          </Button>
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button type="button" onClick={closeModal} variant="outline" size="md" disabled={submitting}>
              İptal
            </Button>
            <Button type="submit" form="category-form" variant="primary" size="md" isLoading={submitting}>
              {editingCategory ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        }
      >
        <form id="category-form" onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <Input
              label="Kategori Adı"
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
              placeholder="Örn: Haberler, Blog"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <Input
              label="Slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: createSlug(e.target.value) })}
              required
              placeholder="Otomatik oluşturulur"
              helperText="URL'de kullanılacak benzersiz tanımlayıcı"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <Input
              label="Açıklama"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Kategori hakkında kısa açıklama (opsiyonel)"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
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

          <div style={{
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <input
                type="checkbox"
                id="autoAddContent"
                checked={formData.autoAddContent}
                onChange={(e) => setFormData({
                  ...formData,
                  autoAddContent: e.target.checked
                })}
                style={{
                  width: '18px',
                  height: '18px',
                  cursor: 'pointer'
                }}
              />
              <label
                htmlFor="autoAddContent"
                style={{
                  fontWeight: '500',
                  color: '#1f2937',
                  fontSize: '14px',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Otomatik İçerik Ekleme
              </label>
            </div>
            <p style={{
              margin: '0 0 12px 30px',
              fontSize: '12px',
              color: '#6b7280',
              lineHeight: '1.5'
            }}>
              Bu kategoriye içerik eklendiğinde, otomatik olarak bu kategorinin kartlarına eklenir. 
              Örneğin "Haberler" kategorisine yeni bir haber eklendiğinde, otomatik olarak haberler sayfasındaki kartlara eklenir.
            </p>
            {formData.autoAddContent && (
              <div style={{ marginLeft: '30px' }}>
                <Select
                  label="Otomatik Ekleme Limiti"
                  value={formData.autoAddLimit?.toString() || '5'}
                  onChange={(e) => setFormData({
                    ...formData,
                    autoAddLimit: parseInt(e.target.value) || 5
                  })}
                  options={[
                    { value: '3', label: 'Son 3 Kart' },
                    { value: '5', label: 'Son 5 Kart' },
                    { value: '10', label: 'Son 10 Kart' },
                    { value: '15', label: 'Son 15 Kart' },
                    { value: '20', label: 'Son 20 Kart' },
                  ]}
                  helperText="Yeni içerik eklendiğinde, bu kategorinin son kaç kartına otomatik ekleneceğini belirler"
                />
              </div>
            )}
          </div>
        </form>
      </Modal>

      {filteredCategories.length === 0 ? (
        <div style={{
          background: '#ffffff',
          padding: '48px',
          borderRadius: '8px',
          textAlign: 'center',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            {searchTerm || filterStatus !== 'all' 
              ? 'Arama kriterlerinize uygun kategori bulunamadı.' 
              : 'Henüz kategori eklenmemiş.'}
          </p>
          <Button
            onClick={openNewCategoryModal}
            variant="primary"
            size="md"
            style={{ marginTop: '16px' }}
          >
            İlk Kategoriyi Ekle
          </Button>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {filteredCategories.map((category) => (
            <div key={category._id} style={{
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', marginBottom: '8px', fontWeight: '600', color: '#1f2937' }}>
                    {category.name}
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', color: '#6b7280', fontSize: '13px', marginBottom: '8px', alignItems: 'center' }}>
                    <span>Slug: <strong>{category.slug}</strong></span>
                    <span>Durum: <strong style={{ color: category.isActive ? '#10b981' : '#ef4444' }}>
                      {category.isActive ? 'Aktif' : 'Pasif'}
                    </strong></span>
                    <span>Sıra: <strong>{category.order || 0}</strong></span>
                    <span style={{ 
                      background: '#e0e7ff', 
                      color: '#6366f1', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      fontWeight: '500',
                      fontSize: '12px'
                    }}>
                      📄 {contentCounts[category._id] || 0} İçerik
                    </span>
                    {category.autoAddContent && (
                      <span style={{ color: '#6366f1', fontWeight: '500' }}>
                        ⚡ Otomatik Ekleme: <strong>Son {category.autoAddLimit || 5} Kart</strong>
                      </span>
                    )}
                    {category.createdAt && (
                      <span>
                        Oluşturulma: <strong>{new Date(category.createdAt).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}</strong>
                      </span>
                    )}
                  </div>
                  {category.description && (
                    <p style={{ color: '#6b7280', fontSize: '14px', margin: 0, lineHeight: '1.6' }}>
                      {category.description}
                    </p>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', marginLeft: '16px', alignItems: 'center' }}>
                  <Button
                    onClick={() => handleEdit(category)}
                    variant="primary"
                    size="sm"
                  >
                    Düzenle
                  </Button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#ef4444',
                      cursor: 'pointer',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      fontSize: '18px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s',
                      width: '32px',
                      height: '32px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#fee2e2';
                      e.currentTarget.style.transform = 'scale(1.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                    title="Kategoriyi Sil"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
