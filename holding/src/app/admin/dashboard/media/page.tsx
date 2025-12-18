'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import LoadingScreen from '@/components/LoadingScreen';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Swal from 'sweetalert2';

interface MediaFile {
  _id: string;
  filename: string;
  originalName: string;
  url: string;
  type: 'image' | 'pdf' | 'other';
  mimeType: string;
  size: number;
  uploadedAt?: string;
  createdAt?: string;
}

export default function MediaManagement() {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'image' | 'pdf'>('all');

  useEffect(() => {
    loadMedia();
  }, [filterType]);

  const loadMedia = async () => {
    try {
      setLoading(true);
      const type = filterType === 'all' ? undefined : filterType;
      const response = await apiClient.getMedia(type);
      setFiles(response.files || []);
    } catch (error) {
      console.error('Medya dosyaları yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // Sadece resim ve PDF dosyalarını kabul et
      const validFiles = filesArray.filter(file => 
        file.type.startsWith('image/') || file.type === 'application/pdf'
      );
      setSelectedFiles(validFiles);
      
      if (validFiles.length < filesArray.length) {
        Swal.fire({
          icon: 'warning',
          title: 'Uyarı!',
          text: 'Sadece resim ve PDF dosyaları kabul edilir. Diğer dosyalar seçilmedi.',
          confirmButtonColor: '#313131'
        });
      }
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      await Swal.fire({
        icon: 'warning',
        title: 'Dosya Seçilmedi!',
        text: 'Lütfen yüklenecek dosya seçin.',
        confirmButtonColor: '#313131'
      });
      return;
    }
    
    try {
      setUploading(true);
      await apiClient.uploadMedia(selectedFiles);
      await Swal.fire({
        icon: 'success',
        title: 'Başarılı!',
        text: 'Dosyalar başarıyla yüklendi.',
        timer: 2000,
        showConfirmButton: false
      });
      setSelectedFiles([]);
      // File input'u temizle
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      await loadMedia();
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Hata!',
        text: error.message || 'Dosya yüklenirken bir hata oluştu',
        confirmButtonColor: '#313131'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Emin misiniz?',
      text: 'Bu dosyayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Evet, Sil!',
      cancelButtonText: 'İptal'
    });

    if (result.isConfirmed) {
      try {
        await apiClient.deleteMedia(id);
        await Swal.fire({
          icon: 'success',
          title: 'Silindi!',
          text: 'Dosya başarıyla silindi.',
          timer: 2000,
          showConfirmButton: false
        });
        await loadMedia();
      } catch (error: any) {
        await Swal.fire({
          icon: 'error',
          title: 'Hata!',
          text: error.message || 'Dosya silinirken bir hata oluştu',
          confirmButtonColor: '#313131'
        });
      }
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
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h1 style={{ fontSize: '24px', color: '#1f2937', fontWeight: '600', margin: 0, letterSpacing: '-0.5px' }}>Medya Yönetimi</h1>
        <Select
          label="Filtrele"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value as any)}
          options={[
            { value: 'all', label: 'Tümü' },
            { value: 'image', label: 'Resimler' },
            { value: 'pdf', label: 'PDF Dosyaları' },
          ]}
          style={{ width: '200px' }}
        />
      </div>

      {/* Yükleme Bölümü */}
      <div style={{ 
        background: '#ffffff', 
        padding: '20px', 
        borderRadius: '8px', 
        border: '1px solid #e5e7eb',
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
        marginBottom: '24px'
      }}>
        <h2 style={{ fontSize: '16px', marginBottom: '16px', color: '#1f2937', fontWeight: '600' }}>
          Dosya Yükle
        </h2>
        <div style={{ 
          border: '1px dashed #d1d5db', 
          borderRadius: '6px', 
          padding: '24px',
          textAlign: 'center',
          transition: 'border-color 0.15s',
          background: '#f9fafb'
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.style.borderColor = '#9ca3af';
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.borderColor = '#d1d5db';
        }}
        >
          <input
            type="file"
            multiple
            onChange={handleFileSelect}
            accept="image/*,application/pdf"
            style={{ display: 'none' }}
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            style={{
              display: 'inline-block',
              padding: '0.5rem 1rem',
              background: '#313131',
              color: 'white',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.875rem',
              transition: 'all 0.2s',
              marginBottom: '12px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#414141';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#313131';
            }}
          >
            Dosya Seç
          </label>
          <p style={{ color: '#6b7280', marginTop: '12px', fontSize: '13px' }}>
            {selectedFiles.length > 0 
              ? `${selectedFiles.length} dosya seçildi` 
              : 'Dosyaları buraya sürükleyin veya tıklayarak seçin'}
          </p>
          {selectedFiles.length > 0 && (
            <Button
              onClick={handleUpload}
              variant="primary"
              size="md"
              isLoading={uploading}
              style={{ marginTop: '12px' }}
            >
              Yükle
            </Button>
          )}
        </div>
      </div>

      {/* Dosya Listesi */}
      {files.length === 0 ? (
        <div style={{ 
          background: '#ffffff', 
          padding: '48px', 
          borderRadius: '8px', 
          textAlign: 'center',
          border: '1px solid #e5e7eb'
        }}>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>Henüz medya dosyası yüklenmemiş.</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', 
          gap: '16px' 
        }}>
          {files.map((file) => (
            <div key={file._id} style={{ 
              background: '#ffffff', 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid #e5e7eb',
            }}
            >
              {file.type === 'image' ? (
                <img 
                  src={file.url} 
                  alt={file.originalName}
                  style={{
                    width: '100%',
                    height: '150px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '0.75rem'
                  }}
                />
              ) : file.type === 'pdf' ? (
                <div style={{
                  width: '100%',
                  height: '150px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '3rem',
                  marginBottom: '0.75rem',
                  border: '2px solid #e2e8f0'
                }}>
                  <span style={{ fontSize: '2rem', marginBottom: '0.5rem', color: '#9ca3af' }}>PDF</span>
                </div>
              ) : (
                <div style={{
                  width: '100%',
                  height: '150px',
                  background: '#f8fafc',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  marginBottom: '0.75rem',
                  color: '#9ca3af'
                }}>
                  Dosya
                </div>
              )}
              <div style={{ marginBottom: '8px' }}>
                <p 
                  title={file.originalName}
                  style={{ 
                    fontSize: '13px', 
                    fontWeight: '500', 
                    color: '#1f2937',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                  {file.originalName}
                </p>
                <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                  {formatFileSize(file.size)}
                </p>
                <p style={{ fontSize: '11px', color: '#9ca3af' }}>
                  {file.type === 'image' ? 'Resim' : file.type === 'pdf' ? 'PDF' : 'Dosya'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ flex: 1, textDecoration: 'none' }}
                >
                  <Button variant="primary" size="sm" style={{ width: '100%' }}>
                    Görüntüle
                  </Button>
                </a>
                <Button
                  onClick={() => handleDelete(file._id)}
                  variant="danger"
                  size="sm"
                  style={{ flex: 1 }}
                >
                  Sil
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
