'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import Modal from '@/components/Modal';
import LoadingScreen from '@/components/LoadingScreen';

interface MenuItem {
  label: string;
  href: string;
  order: number;
  children?: MenuItem[];
}

interface Menu {
  _id: string;
  name: string;
  type: 'main' | 'footer' | 'sidebar';
  items: MenuItem[];
  isActive: boolean;
}

export default function MenuManagement() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'main' as 'main' | 'footer' | 'sidebar',
    items: [] as MenuItem[],
    isActive: true,
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingMenu) {
        await apiClient.updateMenu(editingMenu._id, formData);
      } else {
        await apiClient.createMenu(formData);
      }
      // Başarılı olduğunda modal'ı kapat ve sayfayı yenile
      setShowModal(false);
      setEditingMenu(null);
      setFormData({ name: '', type: 'main', items: [], isActive: true });
      await loadMenus();
    } catch (error: any) {
      alert(error.message || 'Bir hata oluştu');
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
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu menüyü silmek istediğinize emin misiniz?')) return;
    try {
      await apiClient.deleteMenu(id);
      await loadMenus();
    } catch (error: any) {
      alert(error.message || 'Bir hata oluştu');
    }
  };

  const openNewMenuModal = () => {
    setEditingMenu(null);
    setFormData({ name: '', type: 'main', items: [], isActive: true });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingMenu(null);
    setFormData({ name: '', type: 'main', items: [], isActive: true });
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
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600', color: '#313131' }}>Menü Adı</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
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
                <option value="sidebar">Sidebar</option>
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
              <label style={{ fontWeight: '600', color: '#313131', fontSize: '1.1rem' }}>Menü Öğeleri</label>
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

            <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {formData.items.map((item, index) => (
                <div key={index} style={{ 
                  background: '#f8fafc', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  marginBottom: '0.75rem', 
                  border: '1px solid #e2e8f0' 
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: '0.75rem', marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      placeholder="Label"
                      value={item.label}
                      onChange={(e) => updateMenuItem(index, 'label', e.target.value)}
                      style={{ padding: '0.625rem', border: '2px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem' }}
                    />
                    <input
                      type="text"
                      placeholder="Href (#link)"
                      value={item.href}
                      onChange={(e) => updateMenuItem(index, 'href', e.target.value)}
                      style={{ padding: '0.625rem', border: '2px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem' }}
                    />
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
                        {item.children.map((child, childIndex) => (
                          <div key={childIndex} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <input
                              type="text"
                              placeholder="Alt Menü Label"
                              value={child.label}
                              onChange={(e) => {
                                const newItems = [...formData.items];
                                if (!newItems[index].children) newItems[index].children = [];
                                newItems[index].children![childIndex] = { ...newItems[index].children![childIndex], label: e.target.value };
                                setFormData({ ...formData, items: newItems });
                              }}
                              style={{ padding: '0.625rem', border: '2px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem' }}
                            />
                            <input
                              type="text"
                              placeholder="Alt Menü Href"
                              value={child.href}
                              onChange={(e) => {
                                const newItems = [...formData.items];
                                if (!newItems[index].children) newItems[index].children = [];
                                newItems[index].children![childIndex] = { ...newItems[index].children![childIndex], href: e.target.value };
                                setFormData({ ...formData, items: newItems });
                              }}
                              style={{ padding: '0.625rem', border: '2px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem' }}
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
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {formData.items.length === 0 && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  Henüz menü öğesi eklenmedi. Yukarıdaki butona tıklayarak ekleyebilirsiniz.
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
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {menus.map((menu) => (
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
                    <span>Tip: <strong>{menu.type === 'main' ? 'Ana Menü' : menu.type === 'footer' ? 'Footer' : 'Sidebar'}</strong></span>
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
                <strong style={{ color: '#313131', fontSize: '0.95rem' }}>Öğeler:</strong>
                <ul style={{ marginTop: '0.75rem', paddingLeft: '1.5rem', listStyle: 'none' }}>
                  {menu.items
                    .sort((a, b) => a.order - b.order)
                    .map((item, idx) => (
                      <li key={idx} style={{ marginBottom: '0.75rem', color: '#313131' }}>
                        <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                          {item.label} <span style={{ color: '#666', fontWeight: '400', fontSize: '0.9rem' }}>({item.href})</span>
                          <span style={{ color: '#999', fontSize: '0.85rem', marginLeft: '0.5rem' }}>• Sıra: {item.order}</span>
                        </div>
                        {item.children && item.children.length > 0 && (
                          <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem', color: '#666' }}>
                            {item.children
                              .sort((a, b) => a.order - b.order)
                              .map((child, childIdx) => (
                                <li key={childIdx} style={{ marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                                  {child.label} <span style={{ color: '#999' }}>({child.href})</span>
                                  <span style={{ color: '#999', fontSize: '0.85rem', marginLeft: '0.5rem' }}>• Sıra: {child.order}</span>
                                </li>
                              ))}
                          </ul>
                        )}
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
