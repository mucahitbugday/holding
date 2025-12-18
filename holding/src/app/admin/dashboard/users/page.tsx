'use client';

import { useState, useEffect } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import Modal from '@/components/Modal';
import { apiClient } from '@/lib/api-client';
import Swal from 'sweetalert2';

interface User {
  _id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: string;
  isActive?: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user' as 'admin' | 'user',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getUsers(searchTerm || undefined);
      if (response.success && response.users) {
        setUsers(response.users);
      }
    } catch (error: any) {
      console.error('Kullanıcılar yüklenemedi:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: error.message || 'Kullanıcılar yüklenirken bir hata oluştu',
        confirmButtonColor: '#313131'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== undefined) {
        loadUsers();
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'user',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      name: user.name,
      role: user.role,
      isActive: user.isActive !== false,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'user',
      isActive: true,
    });
  };

  const handleSubmit = async () => {
    // Validasyon
    if (!formData.email || !formData.name) {
      await Swal.fire({
        icon: 'warning',
        title: 'Eksik Bilgi!',
        text: 'Email ve isim gereklidir.',
        confirmButtonColor: '#313131'
      });
      return;
    }

    if (!editingUser && !formData.password) {
      await Swal.fire({
        icon: 'warning',
        title: 'Eksik Bilgi!',
        text: 'Yeni kullanıcı için şifre gereklidir.',
        confirmButtonColor: '#313131'
      });
      return;
    }

    if (formData.password && formData.password.length < 6) {
      await Swal.fire({
        icon: 'warning',
        title: 'Geçersiz Şifre!',
        text: 'Şifre en az 6 karakter olmalıdır.',
        confirmButtonColor: '#313131'
      });
      return;
    }

    try {
      setSubmitting(true);
      if (editingUser) {
        // Güncelleme
        const updateData: any = {
          email: formData.email,
          name: formData.name,
          role: formData.role,
          isActive: formData.isActive,
        };
        if (formData.password) {
          updateData.password = formData.password;
        }
        await apiClient.updateUser(editingUser._id, updateData);
        await Swal.fire({
          icon: 'success',
          title: 'Başarılı!',
          text: 'Kullanıcı başarıyla güncellendi.',
          timer: 2000,
          showConfirmButton: false
        });
      } else {
        // Yeni kullanıcı
        await apiClient.createUser({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: formData.role,
          isActive: formData.isActive,
        });
        await Swal.fire({
          icon: 'success',
          title: 'Başarılı!',
          text: 'Kullanıcı başarıyla oluşturuldu.',
          timer: 2000,
          showConfirmButton: false
        });
      }
      closeModal();
      await loadUsers();
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: error.message || 'İşlem sırasında bir hata oluştu',
        confirmButtonColor: '#313131'
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (user: User) => {
    const result = await Swal.fire({
      title: 'Emin misiniz?',
      text: `${user.name} (${user.email}) kullanıcısını silmek istediğinize emin misiniz? Bu işlem geri alınamaz!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Evet, Sil!',
      cancelButtonText: 'İptal'
    });

    if (result.isConfirmed) {
      try {
        await apiClient.deleteUser(user._id);
        await Swal.fire({
          icon: 'success',
          title: 'Silindi!',
          text: 'Kullanıcı başarıyla silindi.',
          timer: 2000,
          showConfirmButton: false
        });
        await loadUsers();
      } catch (error: any) {
        await Swal.fire({
          icon: 'error',
          title: 'Hata!',
          text: error.message || 'Kullanıcı silinirken bir hata oluştu',
          confirmButtonColor: '#313131'
        });
      }
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 style={{ fontSize: '24px', color: '#1f2937', fontWeight: '600', margin: 0, letterSpacing: '-0.5px' }}>Kullanıcı Yönetimi</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'stretch', flexWrap: 'wrap', flex: '1', justifyContent: 'flex-end', minWidth: '300px' }}>
          <div style={{ flex: '1', minWidth: '250px', maxWidth: '400px' }}>
            <Input
              placeholder="Kullanıcı ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <Button variant="primary" size="md" onClick={openAddModal} style={{ whiteSpace: 'nowrap' }}>
            + Yeni Kullanıcı
          </Button>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div style={{ 
          background: '#ffffff', 
          padding: '48px', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz kullanıcı eklenmemiş.'}
          </p>
        </div>
      ) : (
        <div style={{ 
          background: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              tableLayout: 'auto',
              minWidth: '800px'
            }}>
              <thead>
                <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ 
                    padding: '14px 16px', 
                    textAlign: 'left', 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: '#1f2937',
                    whiteSpace: 'nowrap',
                    minWidth: '150px'
                  }}>İsim</th>
                  <th style={{ 
                    padding: '14px 16px', 
                    textAlign: 'left', 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: '#1f2937',
                    whiteSpace: 'nowrap',
                    minWidth: '200px'
                  }}>Email</th>
                  <th style={{ 
                    padding: '14px 16px', 
                    textAlign: 'left', 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: '#1f2937',
                    whiteSpace: 'nowrap',
                    minWidth: '100px'
                  }}>Rol</th>
                  <th style={{ 
                    padding: '14px 16px', 
                    textAlign: 'left', 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: '#1f2937',
                    whiteSpace: 'nowrap',
                    minWidth: '100px'
                  }}>Durum</th>
                  <th style={{ 
                    padding: '14px 16px', 
                    textAlign: 'left', 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: '#1f2937',
                    whiteSpace: 'nowrap',
                    minWidth: '150px'
                  }}>Kayıt Tarihi</th>
                  <th style={{ 
                    padding: '14px 16px', 
                    textAlign: 'right', 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    color: '#1f2937',
                    whiteSpace: 'nowrap',
                    minWidth: '150px'
                  }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr 
                    key={user._id}
                    style={{ 
                      borderBottom: '1px solid #e5e7eb',
                      transition: 'background 0.15s',
                      verticalAlign: 'middle'
                    }}
                  >
                    <td style={{ 
                      padding: '14px 16px', 
                      fontSize: '14px', 
                      color: '#1f2937', 
                      fontWeight: '500',
                      verticalAlign: 'middle'
                    }}>
                      {user.name}
                    </td>
                    <td style={{ 
                      padding: '14px 16px', 
                      fontSize: '14px', 
                      color: '#6b7280',
                      verticalAlign: 'middle'
                    }}>
                      {user.email}
                    </td>
                    <td style={{ 
                      padding: '14px 16px',
                      verticalAlign: 'middle'
                    }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: user.role === 'admin' ? '#fef3c7' : '#e0e7ff',
                        color: user.role === 'admin' ? '#92400e' : '#3730a3',
                        whiteSpace: 'nowrap'
                      }}>
                        {user.role === 'admin' ? 'Admin' : 'Kullanıcı'}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '14px 16px',
                      verticalAlign: 'middle'
                    }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '4px 10px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: user.isActive !== false ? '#d1fae5' : '#fee2e2',
                        color: user.isActive !== false ? '#065f46' : '#991b1b',
                        whiteSpace: 'nowrap'
                      }}>
                        {user.isActive !== false ? 'Aktif' : 'Pasif'}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '14px 16px', 
                      fontSize: '13px', 
                      color: '#6b7280',
                      verticalAlign: 'middle',
                      whiteSpace: 'nowrap'
                    }}>
                      {new Date(user.createdAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                    <td style={{ 
                      padding: '14px 16px', 
                      textAlign: 'right',
                      verticalAlign: 'middle'
                    }}>
                      <div style={{ 
                        display: 'flex', 
                        gap: '8px', 
                        justifyContent: 'flex-end',
                        alignItems: 'center'
                      }}>
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => openEditModal(user)}
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          Düzenle
                        </Button>
                        <button
                          onClick={() => handleDelete(user)}
                          title="Sil"
                          style={{
                            padding: '8px',
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s',
                            width: '36px',
                            height: '36px',
                            flexShrink: 0
                          }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Kullanıcı Ekleme/Düzenleme Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingUser ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
        size="medium"
        footer={
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button
              variant="secondary"
              size="md"
              onClick={closeModal}
              disabled={submitting}
            >
              İptal
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSubmit}
              isLoading={submitting}
            >
              {editingUser ? 'Güncelle' : 'Oluştur'}
            </Button>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <Input
            label="İsim *"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Kullanıcı adı"
          />
          <Input
            label="Email *"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            placeholder="kullanici@example.com"
          />
          <Input
            label={editingUser ? 'Yeni Şifre (değiştirmek istemiyorsanız boş bırakın)' : 'Şifre *'}
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required={!editingUser}
            placeholder="En az 6 karakter"
          />
          <Select
            label="Rol *"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
            options={[
              { value: 'user', label: 'Kullanıcı' },
              { value: 'admin', label: 'Admin' },
            ]}
          />
          <Checkbox
            label="Aktif"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
        </div>
      </Modal>
    </div>
  );
}
