'use client';

import { useState, useEffect } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface User {
  _id: string;
  email: string;
  name: string;
  role?: string;
  createdAt: string;
  isActive?: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // API endpoint'i eklenecek
      // const response = await apiClient.getUsers();
      // setUsers(response.users || []);
      
      // Şimdilik mock data
      setUsers([
        {
          _id: '1',
          email: 'admin@example.com',
          name: 'Admin User',
          role: 'admin',
          createdAt: new Date().toISOString(),
          isActive: true,
        },
      ]);
    } catch (error) {
      console.error('Kullanıcılar yüklenemedi:', error);
    } finally {
      setLoading(false);
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
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h1 style={{ fontSize: '24px', color: '#1f2937', fontWeight: '600', margin: 0, letterSpacing: '-0.5px' }}>Kullanıcı Yönetimi</h1>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <Input
            placeholder="Kullanıcı ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '280px' }}
          />
          <Button variant="primary" size="md">
            + Yeni Kullanıcı
          </Button>
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <div style={{ 
          background: 'white', 
          padding: '3rem', 
          borderRadius: '12px', 
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>
            {searchTerm ? 'Arama sonucu bulunamadı.' : 'Henüz kullanıcı eklenmemiş.'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {filteredUsers.map((user) => (
            <div key={user._id} style={{ 
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', fontWeight: '600', color: '#313131' }}>
                    {user.name}
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', color: '#666', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    <span>Email: <strong>{user.email}</strong></span>
                    <span>Rol: <strong>{user.role || 'user'}</strong></span>
                    <span>Durum: <strong style={{ color: user.isActive !== false ? '#10b981' : '#ef4444' }}>
                      {user.isActive !== false ? 'Aktif' : 'Pasif'}
                    </strong></span>
                    <span>Kayıt: <strong>{new Date(user.createdAt).toLocaleDateString('tr-TR')}</strong></span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem', flexWrap: 'wrap' }}>
                  <Button variant="primary" size="sm">
                    Düzenle
                  </Button>
                  <Button variant="danger" size="sm">
                    Sil
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
