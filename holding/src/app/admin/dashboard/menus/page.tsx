'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import Modal from '@/components/Modal';
import LoadingScreen from '@/components/LoadingScreen';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import Swal from 'sweetalert2';

interface MenuItem {
  _id?: string;
  label: string;
  href: string;
  order: number;
  imageUrl?: string;
  pdfUrl?: string;
  children?: MenuItem[];
}

interface MediaFile {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  type: 'image' | 'pdf' | 'other';
}

interface Menu {
  _id: string;
  name: string;
  type: 'main' | 'footer';
  items: MenuItem[];
  isActive: boolean;
}

export default function MenuManagement() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'main' | 'footer'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'pdf' | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [selectedChildIndex, setSelectedChildIndex] = useState<{ parentIndex: number; childIndex: number } | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'main' as 'main' | 'footer',
    items: [] as MenuItem[],
    isActive: true,
  });
  const [errors, setErrors] = useState<{
    name?: boolean;
    items?: boolean;
    itemLabels?: { [key: number]: boolean };
    itemHrefs?: { [key: number]: boolean };
    childLabels?: { [key: string]: boolean };
    childHrefs?: { [key: string]: boolean };
  }>({});

  useEffect(() => {
    loadMenus();
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      const response = await apiClient.getMedia();
      setMediaFiles(response.files || []);
    } catch (error) {
      console.error('Medya dosyaları yüklenemedi:', error);
    }
  };

  const openMediaModal = (type: 'image' | 'pdf', itemIndex: number, childIndex?: number) => {
    setSelectedMediaType(type);
    setSelectedItemIndex(itemIndex);
    if (childIndex !== undefined) {
      setSelectedChildIndex({ parentIndex: itemIndex, childIndex });
    } else {
      setSelectedChildIndex(null);
    }
    setShowMediaModal(true);
  };

  const selectMedia = (mediaUrl: string) => {
    if (selectedItemIndex === null || !selectedMediaType) return;

    const newItems = [...formData.items];
    if (selectedChildIndex) {
      if (!newItems[selectedChildIndex.parentIndex].children) {
        newItems[selectedChildIndex.parentIndex].children = [];
      }
      const child = newItems[selectedChildIndex.parentIndex].children![selectedChildIndex.childIndex];
      if (selectedMediaType === 'image') {
        child.imageUrl = mediaUrl;
        child.href = mediaUrl;
      } else {
        child.pdfUrl = mediaUrl;
        child.href = mediaUrl;
      }
    } else {
      if (selectedMediaType === 'image') {
        newItems[selectedItemIndex].imageUrl = mediaUrl;
        newItems[selectedItemIndex].href = mediaUrl;
      } else {
        newItems[selectedItemIndex].pdfUrl = mediaUrl;
        newItems[selectedItemIndex].href = mediaUrl;
      }
    }
    setFormData({ ...formData, items: newItems });
    setShowMediaModal(false);
    setSelectedMediaType(null);
    setSelectedItemIndex(null);
    setSelectedChildIndex(null);
  };

  const loadMenus = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMenus();
      setMenus(response.menus || []);
    } catch (error) {
      console.error('Menüler yüklenemedi:', error);
      Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: 'Menüler yüklenirken bir hata oluştu',
      });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = true;
      isValid = false;
    }

    if (formData.items.length === 0) {
      newErrors.items = true;
      isValid = false;
    }

    formData.items.forEach((item, index) => {
      if (!item.label || item.label.trim() === '') {
        if (!newErrors.itemLabels) newErrors.itemLabels = {};
        newErrors.itemLabels[index] = true;
        isValid = false;
      }
      if (!item.href || item.href.trim() === '') {
        if (!newErrors.itemHrefs) newErrors.itemHrefs = {};
        newErrors.itemHrefs[index] = true;
        isValid = false;
      }

      if (item.children && item.children.length > 0) {
        item.children.forEach((child, childIndex) => {
          const childKey = `${index}-${childIndex}`;
          if (!child.label || child.label.trim() === '') {
            if (!newErrors.childLabels) newErrors.childLabels = {};
            newErrors.childLabels[childKey] = true;
            isValid = false;
          }
          if (!child.href || child.href.trim() === '') {
            if (!newErrors.childHrefs) newErrors.childHrefs = {};
            newErrors.childHrefs[childKey] = true;
            isValid = false;
          }
        });
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const createSlug = (text: string): string => {
    const turkishToEnglish: { [key: string]: string } = {
      'ç': 'c', 'Ç': 'C',
      'ğ': 'g', 'Ğ': 'G',
      'ı': 'i', 'İ': 'I',
      'ö': 'o', 'Ö': 'O',
      'ş': 's', 'Ş': 'S',
      'ü': 'u', 'Ü': 'U'
    };

    return text
      .split('')
      .map(char => turkishToEnglish[char] || char)
      .join('')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      await Swal.fire({
        icon: 'error',
        title: 'Eksik Bilgi!',
        html: 'Lütfen tüm zorunlu alanları doldurun.',
        confirmButtonColor: '#313131'
      });
      return;
    }

    setSubmitting(true);
    try {
      const processedItems = formData.items.map(item => {
        if (item.children && item.children.length > 0) {
          const processedChildren = item.children.map(child => {
            let href = child.href;
            if (href && !href.startsWith('/') && !href.startsWith('http') && !href.startsWith('#')) {
              const slug = createSlug(href);
              href = slug ? `/${slug}` : href;
            }
            return { ...child, href };
          });
          return { ...item, children: processedChildren };
        }
        return item;
      });

      const processedFormData = { ...formData, items: processedItems };

      if (editingMenu) {
        if (processedFormData.isActive) {
          const activeMenuOfSameType = menus.find(
            menu => menu.type === processedFormData.type && 
            menu.isActive && 
            menu._id !== editingMenu._id
          );

          if (activeMenuOfSameType) {
            const menuTypeText = processedFormData.type === 'main' ? 'Ana Menü' : 'Footer';
            const result = await Swal.fire({
              title: 'Aktif Menü Mevcut!',
              html: `Aktif bir <strong>${menuTypeText}</strong> zaten var. Bu menüyü aktif yapmak için mevcut aktif menü pasif yapılacak. Devam etmek istiyor musunuz?`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#313131',
              cancelButtonColor: '#6b7280',
              confirmButtonText: 'Evet, Devam Et',
              cancelButtonText: 'İptal'
            });

            if (!result.isConfirmed) {
              setSubmitting(false);
              return;
            }

            await apiClient.updateMenu(activeMenuOfSameType._id, {
              ...activeMenuOfSameType,
              isActive: false
            });
          }
        }

        await apiClient.updateMenu(editingMenu._id, processedFormData);
        await Swal.fire({
          icon: 'success',
          title: 'Başarılı!',
          text: 'Menü başarıyla güncellendi.',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        if (processedFormData.isActive) {
          const activeMenuOfSameType = menus.find(
            menu => menu.type === processedFormData.type && menu.isActive
          );

          if (activeMenuOfSameType) {
            const menuTypeText = processedFormData.type === 'main' ? 'Ana Menü' : 'Footer';
            const result = await Swal.fire({
              title: 'Aktif Menü Mevcut!',
              html: `Aktif bir <strong>${menuTypeText}</strong> zaten var. Yeni menüyü aktif yapmak için mevcut aktif menü pasif yapılacak. Devam etmek istiyor musunuz?`,
              icon: 'warning',
              showCancelButton: true,
              confirmButtonColor: '#313131',
              cancelButtonColor: '#6b7280',
              confirmButtonText: 'Evet, Devam Et',
              cancelButtonText: 'İptal'
            });

            if (!result.isConfirmed) {
              setSubmitting(false);
              return;
            }

            await apiClient.updateMenu(activeMenuOfSameType._id, {
              ...activeMenuOfSameType,
              isActive: false
            });
          }
        }

        await apiClient.createMenu(processedFormData);
        await Swal.fire({
          icon: 'success',
          title: 'Başarılı!',
          text: 'Menü başarıyla oluşturuldu.',
          timer: 2000,
          showConfirmButton: false
        });
      }
      
      setShowModal(false);
      setEditingMenu(null);
      setFormData({ name: '', type: 'main', items: [], isActive: true });
      setErrors({});
      await loadMenus();
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

  const handleEdit = (menu: Menu) => {
    setEditingMenu(menu);
    setFormData({
      name: menu.name,
      type: menu.type,
      items: menu.items,
      isActive: menu.isActive,
    });
    setErrors({});
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Emin misiniz?',
      text: 'Bu menüyü silmek istediğinize emin misiniz? Bu işlem geri alınamaz!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Evet, Sil!',
      cancelButtonText: 'İptal'
    });

    if (result.isConfirmed) {
      try {
        await apiClient.deleteMenu(id);
        await Swal.fire({
          icon: 'success',
          title: 'Silindi!',
          text: 'Menü başarıyla silindi.',
          timer: 2000,
          showConfirmButton: false
        });
        await loadMenus();
      } catch (error: any) {
        await Swal.fire({
          icon: 'error',
          title: 'Hata!',
          text: error.message || 'Menü silinirken bir hata oluştu'
        });
      }
    }
  };

  const openNewMenuModal = () => {
    setEditingMenu(null);
    setFormData({ name: '', type: 'main', items: [], isActive: true });
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMenu(null);
    setFormData({ name: '', type: 'main', items: [], isActive: true });
    setErrors({});
  };

  const addMenuItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { label: '', href: '', order: formData.items.length },
      ],
    });
  };

  const updateMenuItem = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  const removeMenuItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const filteredMenus = menus.filter(menu => {
    const matchesSearch = menu.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      menu.items.some(item =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.children && item.children.some(child =>
          child.label.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      );
    const matchesType = filterType === 'all' || menu.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && menu.isActive) ||
      (filterStatus === 'inactive' && !menu.isActive);
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e5e7eb',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <h1 style={{ fontSize: '24px', color: '#1f2937', fontWeight: '600', margin: 0 }}>Menü Yönetimi</h1>
        <Button onClick={openNewMenuModal} variant="primary" size="md">
          + Yeni Menü
        </Button>
      </div>

      {/* Filters */}
      {menus.length > 0 && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem' 
          }}>
            <Input
              label="Arama"
              placeholder="Menü adı veya öğe adı ile ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Select
              label="Menü Tipi"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              options={[
                { value: 'all', label: 'Tümü' },
                { value: 'main', label: 'Ana Menü' },
                { value: 'footer', label: 'Footer' },
              ]}
            />
            <Select
              label="Durum"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              options={[
                { value: 'all', label: 'Tümü' },
                { value: 'active', label: 'Aktif' },
                { value: 'inactive', label: 'Pasif' },
              ]}
            />
          </div>
          {(searchTerm || filterType !== 'all' || filterStatus !== 'all') && (
            <div style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
              {filteredMenus.length} menü bulundu
            </div>
          )}
        </div>
      )}

      {/* Menu List */}
      {menus.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '1rem' }}>Henüz menü eklenmemiş.</p>
          <Button onClick={openNewMenuModal} variant="primary" size="lg">
            İlk Menüyü Ekle
          </Button>
        </div>
      ) : filteredMenus.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <p style={{ color: '#666', fontSize: '1.1rem', marginBottom: '1rem' }}>
            Arama kriterlerinize uygun menü bulunamadı.
          </p>
          <Button
            onClick={() => {
              setSearchTerm('');
              setFilterType('all');
              setFilterStatus('all');
            }}
            variant="outline"
            size="md"
          >
            Filtreleri Temizle
          </Button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '1.5rem',
        }}>
          {filteredMenus.map((menu) => (
            <div key={menu._id} style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'start', 
                marginBottom: '1rem',
                flexWrap: 'wrap',
                gap: '1rem'
              }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: '600', color: '#313131' }}>
                    {menu.name}
                  </h3>
                  <div style={{ display: 'flex', gap: '1rem', color: '#666', fontSize: '0.9rem', flexWrap: 'wrap' }}>
                    <span>Tip: <strong>{menu.type === 'main' ? 'Ana Menü' : 'Footer'}</strong></span>
                    <span>Durum: <strong style={{ color: menu.isActive ? '#10b981' : '#ef4444' }}>
                      {menu.isActive ? 'Aktif' : 'Pasif'}
                    </strong></span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Button onClick={() => handleEdit(menu)} variant="primary" size="sm">
                    Düzenle
                  </Button>
                  <Button onClick={() => handleDelete(menu._id)} variant="danger" size="sm">
                    Sil
                  </Button>
                </div>
              </div>
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#313131', fontSize: '0.95rem' }}>
                    Öğeler: {menu.items.length} ana öğe, {menu.items.reduce((acc, item) => acc + (item.children?.length || 0), 0)} alt öğe
                  </strong>
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <ul style={{ paddingLeft: '1.5rem', listStyle: 'none' }}>
                    {menu.items
                      .sort((a, b) => a.order - b.order)
                      .map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '1rem', color: '#313131', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px' }}>
                          <div style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <span>{item.label}</span>
                            <span style={{ color: '#666', fontWeight: '400', fontSize: '0.85rem' }}>({item.href})</span>
                            <span style={{ color: '#999', fontSize: '0.8rem' }}>• Sıra: {item.order}</span>
                          </div>
                          {item.children && item.children.length > 0 && (
                            <ul style={{ marginTop: '0.5rem', paddingLeft: '1rem', color: '#666', borderLeft: '2px solid #e2e8f0' }}>
                              {item.children
                                .sort((a, b) => a.order - b.order)
                                .map((child, childIdx) => (
                                  <li key={childIdx} style={{ marginBottom: '0.5rem', fontSize: '0.9rem', padding: '0.25rem 0' }}>
                                    <span style={{ fontWeight: '500' }}>{child.label}</span>
                                    <span style={{ color: '#999', fontSize: '0.85rem', marginLeft: '0.5rem' }}>({child.href})</span>
                                    <span style={{ color: '#999', fontSize: '0.8rem', marginLeft: '0.5rem' }}>• Sıra: {child.order}</span>
                                  </li>
                                ))}
                            </ul>
                          )}
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Menu Form Modal */}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingMenu ? 'Menü Düzenle' : 'Yeni Menü Ekle'}
        size="large"
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
            <Button onClick={closeModal} variant="outline" size="md" disabled={submitting}>
              İptal
            </Button>
            <Button type="submit" form="menu-form" variant="primary" size="md" isLoading={submitting}>
              {editingMenu ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        }
      >
        <form id="menu-form" onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <Input
              label="Menü Adı"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) {
                  setErrors({ ...errors, name: false });
                }
              }}
              required
              error={errors.name}
              errorMessage="Menü adı gereklidir"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <Select
              label="Menü Tipi"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              options={[
                { value: 'main', label: 'Ana Menü' },
                { value: 'footer', label: 'Footer' },
              ]}
            />
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Checkbox
                label="Aktif"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              />
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <label style={{ fontWeight: '600', color: '#313131', fontSize: '1rem' }}>
                Menü Öğeleri
                <span style={{ color: '#dc2626', marginLeft: '0.25rem' }}>*</span>
                {errors.items && <span style={{ color: '#dc2626', fontSize: '0.9rem', marginLeft: '0.5rem' }}>(En az bir öğe gerekli)</span>}
              </label>
              <Button type="button" onClick={addMenuItem} variant="secondary" size="sm">
                + Öğe Ekle
              </Button>
            </div>

            <div style={{ maxHeight: '500px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {formData.items.map((item, index) => (
                <div key={index} style={{
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '0.75rem',
                  border: `1px solid ${errors.items ? '#dc2626' : '#e2e8f0'}`
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <Input
                      placeholder="Label *"
                      value={item.label}
                      onChange={(e) => {
                        updateMenuItem(index, 'label', e.target.value);
                        if (errors.itemLabels && errors.itemLabels[index]) {
                          const newItemLabels = { ...errors.itemLabels };
                          delete newItemLabels[index];
                          setErrors({ ...errors, itemLabels: newItemLabels });
                        }
                      }}
                      error={errors.itemLabels && errors.itemLabels[index]}
                    />
                    <Input
                      placeholder="Href *"
                      value={item.href}
                      onChange={(e) => {
                        if (item.imageUrl || item.pdfUrl) return;
                        updateMenuItem(index, 'href', e.target.value);
                        if (errors.itemHrefs && errors.itemHrefs[index]) {
                          const newItemHrefs = { ...errors.itemHrefs };
                          delete newItemHrefs[index];
                          setErrors({ ...errors, itemHrefs: newItemHrefs });
                        }
                      }}
                      disabled={!!(item.imageUrl || item.pdfUrl)}
                      error={errors.itemHrefs && errors.itemHrefs[index]}
                    />
                    <Input
                      type="number"
                      placeholder="Sıra"
                      value={item.order}
                      onChange={(e) => updateMenuItem(index, 'order', parseInt(e.target.value) || 0)}
                    />
                    <Button
                      type="button"
                      onClick={() => removeMenuItem(index)}
                      variant="danger"
                      size="sm"
                    >
                      Sil
                    </Button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Button
                      type="button"
                      onClick={() => {
                        const newItems = [...formData.items];
                        if (!newItems[index].children) {
                          newItems[index].children = [];
                        }
                        newItems[index].children = [
                          ...(newItems[index].children || []),
                          { label: '', href: '', order: (newItems[index].children?.length || 0) },
                        ];
                        setFormData({ ...formData, items: newItems });
                      }}
                      variant="secondary"
                      size="sm"
                    >
                      + Alt Menü
                    </Button>
                    <Button
                      type="button"
                      onClick={() => openMediaModal('image', index)}
                      variant="success"
                      size="sm"
                    >
                      🖼️ Resim
                    </Button>
                    <Button
                      type="button"
                      onClick={() => openMediaModal('pdf', index)}
                      variant="success"
                      size="sm"
                    >
                      📄 PDF
                    </Button>
                    {item.imageUrl && (
                      <span style={{ fontSize: '0.875rem', color: '#10b981', display: 'flex', alignItems: 'center' }}>
                        ✓ Resim seçildi
                      </span>
                    )}
                    {item.pdfUrl && (
                      <span style={{ fontSize: '0.875rem', color: '#3b82f6', display: 'flex', alignItems: 'center' }}>
                        ✓ PDF seçildi
                      </span>
                    )}
                  </div>
                  {item.children && item.children.length > 0 && (
                    <div style={{ marginTop: '0.75rem', paddingLeft: '1rem', borderLeft: '3px solid #313131' }}>
                      {item.children.map((child, childIndex) => {
                        const childKey = `${index}-${childIndex}`;
                        return (
                          <div key={childIndex} style={{ marginBottom: '0.75rem' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '0.5rem' }}>
                              <Input
                                placeholder="Alt Menü Label *"
                                value={child.label}
                                onChange={(e) => {
                                  const newItems = [...formData.items];
                                  if (!newItems[index].children) newItems[index].children = [];
                                  const newLabel = e.target.value;
                                  let newHref = child.href;
                                  if (newLabel && !child._id) {
                                    const slug = createSlug(newLabel);
                                    newHref = slug ? `/${slug}` : '';
                                  }
                                  newItems[index].children![childIndex] = {
                                    ...newItems[index].children![childIndex],
                                    label: newLabel,
                                    href: newHref
                                  };
                                  setFormData({ ...formData, items: newItems });
                                  if (errors.childLabels && errors.childLabels[childKey]) {
                                    const newChildLabels = { ...errors.childLabels };
                                    delete newChildLabels[childKey];
                                    setErrors({ ...errors, childLabels: newChildLabels });
                                  }
                                }}
                                error={errors.childLabels && errors.childLabels[childKey]}
                              />
                              <Input
                                placeholder="Alt Menü Href *"
                                value={child.href}
                                onChange={(e) => {
                                  if (child.imageUrl || child.pdfUrl) return;
                                  const newItems = [...formData.items];
                                  if (!newItems[index].children) newItems[index].children = [];
                                  newItems[index].children![childIndex] = { ...newItems[index].children![childIndex], href: e.target.value };
                                  setFormData({ ...formData, items: newItems });
                                  if (errors.childHrefs && errors.childHrefs[childKey]) {
                                    const newChildHrefs = { ...errors.childHrefs };
                                    delete newChildHrefs[childKey];
                                    setErrors({ ...errors, childHrefs: newChildHrefs });
                                  }
                                }}
                                disabled={!!(child.imageUrl || child.pdfUrl)}
                                error={errors.childHrefs && errors.childHrefs[childKey]}
                              />
                              <Input
                                type="number"
                                placeholder="Sıra"
                                value={child.order}
                                onChange={(e) => {
                                  const newItems = [...formData.items];
                                  if (!newItems[index].children) newItems[index].children = [];
                                  newItems[index].children![childIndex] = { ...newItems[index].children![childIndex], order: parseInt(e.target.value) || 0 };
                                  setFormData({ ...formData, items: newItems });
                                }}
                              />
                              <Button
                                type="button"
                                onClick={() => {
                                  const newItems = [...formData.items];
                                  if (newItems[index].children) {
                                    newItems[index].children = newItems[index].children!.filter((_, i) => i !== childIndex);
                                  }
                                  setFormData({ ...formData, items: newItems });
                                }}
                                variant="danger"
                                size="sm"
                              >
                                Sil
                              </Button>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                              <Button
                                type="button"
                                onClick={() => openMediaModal('image', index, childIndex)}
                                variant="success"
                                size="sm"
                              >
                                🖼️ Resim
                              </Button>
                              <Button
                                type="button"
                                onClick={() => openMediaModal('pdf', index, childIndex)}
                                variant="success"
                                size="sm"
                              >
                                📄 PDF
                              </Button>
                              {child.imageUrl && (
                                <span style={{ fontSize: '0.8rem', color: '#10b981' }}>✓ Resim</span>
                              )}
                              {child.pdfUrl && (
                                <span style={{ fontSize: '0.8rem', color: '#3b82f6' }}>✓ PDF</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
              {formData.items.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: errors.items ? '#dc2626' : '#666' }}>
                  {errors.items ? 'En az bir menü öğesi eklemelisiniz!' : 'Henüz menü öğesi eklenmedi.'}
                </div>
              )}
            </div>
          </div>
        </form>
      </Modal>

      {/* Media Selection Modal */}
      <Modal
        isOpen={showMediaModal}
        onClose={() => {
          setShowMediaModal(false);
          setSelectedMediaType(null);
          setSelectedItemIndex(null);
          setSelectedChildIndex(null);
        }}
        title={selectedMediaType === 'image' ? 'Resim Seç' : 'PDF Seç'}
        size="large"
      >
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {mediaFiles.filter(file => file.type === selectedMediaType).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
              {selectedMediaType === 'image' ? 'Henüz resim yüklenmemiş.' : 'Henüz PDF yüklenmemiş.'}
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
              gap: '1rem' 
            }}>
              {mediaFiles
                .filter(file => file.type === selectedMediaType)
                .map((file) => (
                  <div
                    key={file._id}
                    onClick={() => selectMedia(file.url)}
                    style={{
                      cursor: 'pointer',
                      border: '2px solid #e2e8f0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#313131';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e2e8f0';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {file.type === 'image' ? (
                      <img
                        src={file.url}
                        alt={file.originalName}
                        style={{
                          width: '100%',
                          height: '120px',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '120px',
                        background: '#f8fafc',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '3rem'
                      }}>
                        📄
                      </div>
                    )}
                    <div style={{ padding: '0.5rem' }}>
                      <p style={{
                        fontSize: '0.8rem',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: '#313131'
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
    </div>
  );
}
