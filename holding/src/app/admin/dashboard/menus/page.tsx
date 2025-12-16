'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

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
  const [showForm, setShowForm] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
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
    try {
      if (editingMenu) {
        await apiClient.updateMenu(editingMenu._id, formData);
      } else {
        await apiClient.createMenu(formData);
      }
      setShowForm(false);
      setEditingMenu(null);
      setFormData({ name: '', type: 'main', items: [], isActive: true });
      loadMenus();
    } catch (error: any) {
      alert(error.message || 'Bir hata oluştu');
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
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu menüyü silmek istediğinize emin misiniz?')) return;
    try {
      await apiClient.deleteMenu(id);
      loadMenus();
    } catch (error: any) {
      alert(error.message || 'Bir hata oluştu');
    }
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
    return <div>Yükleniyor...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#313131' }}>Menü Yönetimi</h1>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingMenu(null);
            setFormData({ name: '', type: 'main', items: [], isActive: true });
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
          + Yeni Menü
        </button>
      </div>

      {showForm && (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '10px', marginBottom: '2rem', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>{editingMenu ? 'Menü Düzenle' : 'Yeni Menü'}</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Menü Adı</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '5px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Menü Tipi</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  style={{ width: '100%', padding: '0.75rem', border: '2px solid #e2e8f0', borderRadius: '5px' }}
                >
                  <option value="main">Ana Menü</option>
                  <option value="footer">Footer</option>
                  <option value="sidebar">Sidebar</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.75rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Aktif
                </label>
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label style={{ fontWeight: '500' }}>Menü Öğeleri</label>
                <button
                  type="button"
                  onClick={addMenuItem}
                  style={{
                    background: '#414141',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                >
                  + Öğe Ekle
                </button>
              </div>

              {formData.items.map((item, index) => (
                <div key={index} style={{ background: '#f8fafc', padding: '1rem', borderRadius: '5px', marginBottom: '0.5rem', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Label"
                      value={item.label}
                      onChange={(e) => updateMenuItem(index, 'label', e.target.value)}
                      style={{ padding: '0.5rem', border: '2px solid #e2e8f0', borderRadius: '5px' }}
                    />
                    <input
                      type="text"
                      placeholder="Href (#link)"
                      value={item.href}
                      onChange={(e) => updateMenuItem(index, 'href', e.target.value)}
                      style={{ padding: '0.5rem', border: '2px solid #e2e8f0', borderRadius: '5px' }}
                    />
                    <input
                      type="number"
                      placeholder="Sıra"
                      value={item.order}
                      onChange={(e) => updateMenuItem(index, 'order', parseInt(e.target.value) || 0)}
                      style={{ padding: '0.5rem', border: '2px solid #e2e8f0', borderRadius: '5px' }}
                    />
                    <button
                      type="button"
                      onClick={() => removeMenuItem(index)}
                      style={{
                        background: '#c33',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem',
                        borderRadius: '5px',
                        cursor: 'pointer',
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
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '0.875rem',
                      }}
                    >
                      + Alt Menü Ekle
                    </button>
                    {item.children && item.children.length > 0 && (
                      <div style={{ marginTop: '0.5rem', paddingLeft: '1rem', borderLeft: '2px solid #313131' }}>
                        {item.children.map((child, childIndex) => (
                          <div key={childIndex} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
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
                              style={{ padding: '0.5rem', border: '2px solid #e2e8f0', borderRadius: '5px' }}
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
                              style={{ padding: '0.5rem', border: '2px solid #e2e8f0', borderRadius: '5px' }}
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
                              style={{ padding: '0.5rem', border: '2px solid #e2e8f0', borderRadius: '5px' }}
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
                                background: '#c33',
                                color: 'white',
                                border: 'none',
                                padding: '0.5rem',
                                borderRadius: '5px',
                                cursor: 'pointer',
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
                {editingMenu ? 'Güncelle' : 'Oluştur'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingMenu(null);
                  setFormData({ name: '', type: 'main', items: [], isActive: true });
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
        {menus.map((menu) => (
          <div key={menu._id} style={{ background: 'white', padding: '1.5rem', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{menu.name}</h3>
                <p style={{ color: '#666' }}>Tip: {menu.type} | Aktif: {menu.isActive ? 'Evet' : 'Hayır'}</p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => handleEdit(menu)}
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
                  onClick={() => handleDelete(menu._id)}
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
            <div>
              <strong>Öğeler:</strong>
              <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                {menu.items
                  .sort((a, b) => a.order - b.order)
                  .map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '0.5rem' }}>
                      <strong>{item.label}</strong> ({item.href}) - Sıra: {item.order}
                      {item.children && item.children.length > 0 && (
                        <ul style={{ marginTop: '0.25rem', paddingLeft: '1.5rem', color: '#666' }}>
                          {item.children
                            .sort((a, b) => a.order - b.order)
                            .map((child, childIdx) => (
                              <li key={childIdx}>
                                {child.label} ({child.href}) - Sıra: {child.order}
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
    </div>
  );
}
