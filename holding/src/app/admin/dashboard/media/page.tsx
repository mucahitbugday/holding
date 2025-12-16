'use client';

import { useState, useEffect } from 'react';
import LoadingScreen from '@/components/LoadingScreen';

interface MediaFile {
  _id: string;
  filename: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export default function MediaManagement() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    try {
      setLoading(true);
      // API endpoint'i eklenecek
      // const response = await apiClient.getMedia();
      // setFiles(response.files || []);
      
      // Şimdilik mock data
      setFiles([]);
    } catch (error) {
      console.error('Medya dosyaları yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      setUploading(true);
      // API endpoint'i eklenecek
      // await apiClient.uploadMedia(selectedFiles);
      alert('Dosya yükleme özelliği yakında eklenecek!');
      setSelectedFiles([]);
      await loadMedia();
    } catch (error: any) {
      alert(error.message || 'Dosya yüklenirken bir hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu dosyayı silmek istediğinize emin misiniz?')) return;
    try {
      // API endpoint'i eklenecek
      // await apiClient.deleteMedia(id);
      await loadMedia();
    } catch (error: any) {
      alert(error.message || 'Dosya silinirken bir hata oluştu');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
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
        <h1 style={{ fontSize: '2rem', color: '#313131', fontWeight: '700', margin: 0 }}>Medya Yönetimi</h1>
      </div>

      {/* Yükleme Bölümü */}
      <div style={{ 
        background: 'white', 
        padding: '2rem', 
        borderRadius: '12px', 
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#313131', fontWeight: '600' }}>
          Dosya Yükle
        </h2>
        <div style={{ 
          border: '2px dashed #e2e8f0', 
          borderRadius: '8px', 
          padding: '2rem',
          textAlign: 'center',
          transition: 'border-color 0.2s'
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = '#313131';
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.borderColor = '#e2e8f0';
        }}
        >
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            accept="image/*,video/*"
            style={{ display: 'none' }}
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            style={{
              display: 'inline-block',
              padding: '1rem 2rem',
              background: 'linear-gradient(135deg, #313131 0%, #414141 100%)',
              color: 'white',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              transition: 'all 0.3s',
              marginBottom: '1rem'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            📁 Dosya Seç
          </label>
          <p style={{ color: '#666', marginTop: '1rem' }}>
            {selectedFiles.length > 0 
              ? `${selectedFiles.length} dosya seçildi` 
              : 'Dosyaları buraya sürükleyin veya tıklayarak seçin'}
          </p>
          {selectedFiles.length > 0 && (
            <button
              onClick={handleUpload}
              disabled={uploading}
              style={{
                marginTop: '1rem',
                background: uploading ? '#ccc' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                cursor: uploading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '1rem',
                transition: 'all 0.3s',
              }}
            >
              {uploading ? 'Yükleniyor...' : 'Yükle'}
            </button>
          )}
        </div>
      </div>

      {/* Dosya Listesi */}
      {files.length === 0 ? (
        <div style={{ 
          background: 'white', 
          padding: '3rem', 
          borderRadius: '12px', 
          textAlign: 'center',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <p style={{ color: '#666', fontSize: '1.1rem' }}>Henüz medya dosyası yüklenmemiş.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {files.map((file) => (
            <div key={file._id} style={{ 
              background: 'white', 
              padding: '1rem', 
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
              {file.type.startsWith('image/') ? (
                <img 
                  src={file.url} 
                  alt={file.filename}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '0.75rem'
                  }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '150px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  marginBottom: '0.75rem'
                }}>
                  📄
                </div>
              )}
              <div style={{ marginBottom: '0.5rem' }}>
                <p style={{ 
                  fontSize: '0.9rem', 
                  fontWeight: '600', 
                  color: '#313131',
                  marginBottom: '0.25rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {file.filename}
                </p>
                <p style={{ fontSize: '0.8rem', color: '#666' }}>
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                onClick={() => handleDelete(file._id)}
                style={{
                  width: '100%',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  padding: '0.5rem',
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
          ))}
        </div>
      )}
    </div>
  );
}
