'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import Modal from '@/components/Modal';
import LoadingScreen from '@/components/LoadingScreen';
import Swal from 'sweetalert2';

interface MenuItem {
  _id?: string;
  label: string;
  href: string;
  order: number;
  children?: MenuItem[];
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
  }, []);

  const loadMenus = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMenus();
      setMenus(response.menus || []);
    } catch (error) {
      console.error('Menüler yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    let isValid = true;

    // Menü adı kontrolü
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = true;
      isValid = false;
    }

    // Menü öğeleri kontrolü
    if (formData.items.length === 0) {
      newErrors.items = true;
      isValid = false;
    }

    // Her menü öğesi için kontrol
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

      // Alt menü öğeleri için kontrol
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validasyonu
    if (!validateForm()) {
      await Swal.fire({
        icon: 'error',
        title: 'Eksik Bilgi!',
        html: 'Lütfen tüm zorunlu alanları doldurun. Kırmızı ile işaretli alanlar zorunludur.',
        confirmButtonColor: '#313131'
      });
      return;
    }

    setSubmitting(true);
    try {
      // Alt menülerin href'lerini slug formatına çevir
      const processedItems = formData.items.map(item => {
        if (item.children && item.children.length > 0) {
          const processedChildren = item.children.map(child => {
            let href = child.href;
            if (href) {
              // Eğer / ile başlamıyorsa, slug formatına çevir
              if (!href.startsWith('/')) {
                // # ile başlıyorsa #'i kaldır
                if (href.startsWith('#')) {
                  href = href.substring(1);
                }
                const slug = createSlug(href);
                href = slug ? `/${slug}` : href;
              } else {
                // / işaretinden sonrasını slug formatına çevir
                const slugPart = href.substring(1);
                const slug = createSlug(slugPart);
                href = slug ? `/${slug}` : '/';
              }
            } else if (child.label) {
              // Eğer href boşsa ama label varsa, label'dan slug oluştur
              const slug = createSlug(child.label);
              href = slug ? `/${slug}` : '';
            }
            return { ...child, href };
          });
          return { ...item, children: processedChildren };
        }
        return item;
      });

      const processedFormData = { ...formData, items: processedItems };

      if (editingMenu) {
        // Menü güncellenirken, eğer aktif yapılıyorsa ve aynı tipte başka aktif menü varsa kontrol et
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
              return; // İşlemi iptal et
            }

            // Mevcut aktif menüyü pasif yap
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
        // Yeni menü eklerken, eğer aktif yapılıyorsa aynı tipte aktif menü var mı kontrol et
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
              return; // İşlemi iptal et
            }

            // Mevcut aktif menüyü pasif yap
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
      // Başarılı olduğunda modal'ı kapat ve sayfayı yenile
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

  // Türkçe karakterleri İngilizce karakterlere çevir ve slug oluştur
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
      .replace(/\s+/g, '-')  // Boşlukları "-" ile değiştir
      .replace(/[^a-z0-9-]/g, '')  // Sadece harf, rakam ve "-" bırak
      .replace(/-+/g, '-')  // Birden fazla "-" varsa tek "-" yap
      .replace(/^-|-$/g, '');  // Başta ve sonda "-" varsa kaldır
  };

  // Filtrelenmiş menüleri getir
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
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #e2e8f0'
      }}>
        <h1 style={{ fontSize: '2rem', color: '#313131', fontWeight: '700', margin: 0 }}>Menü Yönetimi</h1>
        <button
          onClick={openNewMenuModal}
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
          + Yeni Menü
        </button>
      </div>

      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title={editingMenu ? 'Menü Düzenle' : 'Yeni Menü Ekle'}
        size="large"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#313131' }}>
              Menü Adı <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) {
                  setErrors({ ...errors, name: false });
                }
              }}
              required
              style={{
                width: '100%',
                padding: '0.75rem',
                border: `2px solid ${errors.name ? '#dc2626' : '#e2e8f0'}`,
                borderRadius: '8px',
                fontSize: '1rem',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#313131'}
              onBlur={(e) => {
                if (!errors.name) {
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#313131' }}>Menü Tipi</label>
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
                <option value="main">Ana Menü</option>
                <option value="footer">Footer</option>
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ fontWeight: '600', color: '#313131', fontSize: '1.1rem' }}>
                Menü Öğeleri <span style={{ color: '#dc2626' }}>*</span>
                {errors.items && <span style={{ color: '#dc2626', fontSize: '0.9rem', marginLeft: '0.5rem' }}>(En az bir öğe gerekli)</span>}
              </label>
              <button
                type="button"
                onClick={addMenuItem}
                style={{
                  background: '#414141',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '500',
                  fontSize: '0.9rem',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#313131'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#414141'}
              >
                + Öğe Ekle
              </button>
            </div>

            <div style={{ maxHeight: '600px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {formData.items.map((item, index) => (
                <div key={index} style={{
                  background: '#f8fafc',
                  padding: '1rem',
                  borderRadius: '8px',
                  marginBottom: '0.75rem',
                  border: `1px solid ${errors.items ? '#dc2626' : '#e2e8f0'}`
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <div>
                      <input
                        type="text"
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
                        style={{ 
                          width: '100%',
                          padding: '0.625rem', 
                          border: `2px solid ${errors.itemLabels && errors.itemLabels[index] ? '#dc2626' : '#e2e8f0'}`, 
                          borderRadius: '6px', 
                          fontSize: '0.9rem' 
                        }}
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Href *"
                        value={item.href}
                        onChange={(e) => {
                          updateMenuItem(index, 'href', e.target.value);
                          if (errors.itemHrefs && errors.itemHrefs[index]) {
                            const newItemHrefs = { ...errors.itemHrefs };
                            delete newItemHrefs[index];
                            setErrors({ ...errors, itemHrefs: newItemHrefs });
                          }
                        }}
                        style={{ 
                          width: '100%',
                          padding: '0.625rem', 
                          border: `2px solid ${errors.itemHrefs && errors.itemHrefs[index] ? '#dc2626' : '#e2e8f0'}`, 
                          borderRadius: '6px', 
                          fontSize: '0.9rem' 
                        }}
                      />
                    </div>
                    <input
                      type="number"
                      placeholder="Sıra"
                      value={item.order}
                      onChange={(e) => updateMenuItem(index, 'order', parseInt(e.target.value) || 0)}
                      style={{ padding: '0.625rem', border: '2px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeMenuItem(index)}
                      style={{
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        padding: '0.625rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      Sil
                    </button>
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <button
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
                      style={{
                        background: '#414141',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                        fontWeight: '500'
                      }}
                    >
                      + Alt Menü Ekle
                    </button>
                    {item.children && item.children.length > 0 && (
                      <div style={{ marginTop: '0.75rem', paddingLeft: '1rem', borderLeft: '3px solid #313131' }}>
                        {item.children.map((child, childIndex) => {
                          const childKey = `${index}-${childIndex}`;
                          return (
                          <div key={childIndex} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <input
                              type="text"
                              placeholder="Alt Menü Label *"
                              value={child.label}
                              onChange={(e) => {
                                const newItems = [...formData.items];
                                if (!newItems[index].children) newItems[index].children = [];
                                const newLabel = e.target.value;
                                const currentHref = child.href;
                                const hasId = child._id; // ID var mı kontrol et

                                let newHref = currentHref;

                                if (newLabel && newLabel.trim() !== '') {
                                  if (!hasId) {
                                    // ID yoksa (yeni menü): label değiştiğinde otomatik slug ile href oluştur
                                    const slug = createSlug(newLabel);
                                    newHref = slug ? `/${slug}` : '';
                                  } else {
                                    // ID varsa (kayıtlı menü): href boşsa otomatik slug ile doldur, doluysa değiştirme
                                    if (!currentHref || currentHref === '') {
                                      const slug = createSlug(newLabel);
                                      newHref = slug ? `/${slug}` : '';
                                    }
                                    // href doluysa değiştirme (zaten newHref = currentHref)
                                  }
                                }

                                newItems[index].children![childIndex] = {
                                  ...newItems[index].children![childIndex],
                                  label: newLabel,
                                  href: newHref
                                };
                                setFormData({ ...formData, items: newItems });
                                
                                // Hata durumunu temizle
                                if (errors.childLabels && errors.childLabels[childKey]) {
                                  const newChildLabels = { ...errors.childLabels };
                                  delete newChildLabels[childKey];
                                  setErrors({ ...errors, childLabels: newChildLabels });
                                }
                              }}
                              style={{ 
                                padding: '0.625rem', 
                                border: `2px solid ${errors.childLabels && errors.childLabels[childKey] ? '#dc2626' : '#e2e8f0'}`, 
                                borderRadius: '6px', 
                                fontSize: '0.9rem' 
                              }}
                            />
                            <input
                              type="text"
                              placeholder="Alt Menü Href *"
                              value={child.href}
                              onChange={(e) => {
                                const newItems = [...formData.items];
                                if (!newItems[index].children) newItems[index].children = [];
                                // Boşlukları "-" ile değiştir (yazmayı engelleme, sadece replace)
                                let hrefValue = e.target.value;
                                // Eğer / ile başlamıyorsa ve boşluk varsa, boşlukları "-" ile değiştir
                                if (hrefValue && !hrefValue.startsWith('/')) {
                                  hrefValue = hrefValue.replace(/\s+/g, '-');
                                } else if (hrefValue && hrefValue.startsWith('/')) {
                                  // / işaretinden sonrasındaki boşlukları "-" ile değiştir
                                  const afterSlash = hrefValue.substring(1);
                                  const replaced = afterSlash.replace(/\s+/g, '-');
                                  hrefValue = `/${replaced}`;
                                }
                                newItems[index].children![childIndex] = { ...newItems[index].children![childIndex], href: hrefValue };
                                setFormData({ ...formData, items: newItems });
                                
                                // Hata durumunu temizle
                                if (errors.childHrefs && errors.childHrefs[childKey]) {
                                  const newChildHrefs = { ...errors.childHrefs };
                                  delete newChildHrefs[childKey];
                                  setErrors({ ...errors, childHrefs: newChildHrefs });
                                }
                              }}
                              style={{ 
                                padding: '0.625rem', 
                                border: `2px solid ${errors.childHrefs && errors.childHrefs[childKey] ? '#dc2626' : '#e2e8f0'}`, 
                                borderRadius: '6px', 
                                fontSize: '0.9rem' 
                              }}
                            />
                            <input
                              type="number"
                              placeholder="Sıra"
                              value={child.order}
                              onChange={(e) => {
                                const newItems = [...formData.items];
                                if (!newItems[index].children) newItems[index].children = [];
                                newItems[index].children![childIndex] = { ...newItems[index].children![childIndex], order: parseInt(e.target.value) || 0 };
                                setFormData({ ...formData, items: newItems });
                              }}
                              style={{ padding: '0.625rem', border: '2px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem' }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const newItems = [...formData.items];
                                if (newItems[index].children) {
                                  newItems[index].children = newItems[index].children!.filter((_, i) => i !== childIndex);
                                }
                                setFormData({ ...formData, items: newItems });
                              }}
                              style={{
                                background: '#dc2626',
                                color: 'white',
                                border: 'none',
                                padding: '0.625rem',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.9rem',
                                fontWeight: '500'
                              }}
                            >
                              Sil
                            </button>
                          </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {formData.items.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: errors.items ? '#dc2626' : '#666' }}>
                  {errors.items ? 'En az bir menü öğesi eklemelisiniz!' : 'Henüz menü öğesi eklenmedi. Yukarıdaki butona tıklayarak ekleyebilirsiniz.'}
                </div>
              )}
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
              {submitting ? 'Kaydediliyor...' : (editingMenu ? 'Güncelle' : 'Oluştur')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Arama ve Filtre */}
      {menus.length > 0 && (
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '12px',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#313131' }}>
                Arama
              </label>
              <input
                type="text"
                placeholder="Menü adı veya öğe adı ile ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#313131' }}>
                Menü Tipi
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Tümü</option>
                <option value="main">Ana Menü</option>
                <option value="footer">Footer</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#313131' }}>
                Durum
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Tümü</option>
                <option value="active">Aktif</option>
                <option value="inactive">Pasif</option>
              </select>
            </div>
          </div>
          {(searchTerm || filterType !== 'all' || filterStatus !== 'all') && (
            <div style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
              {filteredMenus.length} menü bulundu
            </div>
          )}
        </div>
      )}

      {menus.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>Henüz menü eklenmemiş.</p>
          <button
            onClick={openNewMenuModal}
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
            İlk Menüyü Ekle
          </button>
        </div>
      ) : filteredMenus.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '3rem',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            {searchTerm || filterType !== 'all' || filterStatus !== 'all'
              ? 'Arama kriterlerinize uygun menü bulunamadı.'
              : 'Henüz menü eklenmemiş.'}
          </p>
          {(searchTerm || filterType !== 'all' || filterStatus !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setFilterStatus('all');
              }}
              style={{
                marginTop: '1rem',
                background: '#313131',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gap: '1.5rem',
          maxHeight: 'calc(100vh - 300px)',
          overflowY: 'auto',
          paddingRight: '0.5rem'
        }}>
          {filteredMenus.map((menu) => (
            <div key={menu._id} style={{
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
                <div>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: '600', color: '#313131' }}>{menu.name}</h3>
                  <div style={{ display: 'flex', gap: '1rem', color: '#666', fontSize: '0.9rem' }}>
                    <span>Tip: <strong>{menu.type === 'main' ? 'Ana Menü' : 'Footer'}</strong></span>
                    <span>Durum: <strong style={{ color: menu.isActive ? '#10b981' : '#ef4444' }}>{menu.isActive ? 'Aktif' : 'Pasif'}</strong></span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleEdit(menu)}
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
                    onClick={() => handleDelete(menu._id)}
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
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <strong style={{ color: '#313131', fontSize: '0.95rem' }}>
                    Öğeler: {menu.items.length} ana öğe, {menu.items.reduce((acc, item) => acc + (item.children?.length || 0), 0)} alt öğe
                  </strong>
                </div>
                <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                  <ul style={{ paddingLeft: '1.5rem', listStyle: 'none' }}>
                    {menu.items
                      .sort((a, b) => a.order - b.order)
                      .map((item, idx) => (
                        <li key={idx} style={{ marginBottom: '1rem', color: '#313131', padding: '0.75rem', background: '#f8fafc', borderRadius: '6px' }}>
                          <div style={{ fontWeight: '600', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
    </div>
  );
}
