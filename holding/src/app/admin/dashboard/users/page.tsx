'use client';

import { useState, useEffect } from 'react';
import LoadingScreen from '@/components/LoadingScreen';

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
        marginBottom: '2rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #e2e8f0'
      }}>
        <h1 style={{ fontSize: '2rem', color: '#313131', fontWeight: '700', margin: 0 }}>Kullanıcı Yönetimi</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Kullanıcı ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.75rem 1rem',
              border: '2px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '1rem',
              width: '300px',
              transition: 'border-color 0.2s'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#313131'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#e2e8f0'}
          />
          <button
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
            + Yeni Kullanıcı
          </button>
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
                <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '1rem' }}>
                  <button
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
