'use client';

import { useState, useEffect } from 'react';
import LoadingScreen from '@/components/LoadingScreen';
import { apiClient } from '@/lib/api-client';
import Swal from 'sweetalert2';

interface Settings {
  _id?: string;
  // Genel Bilgiler
  siteName: string;
  siteDescription: string;
  siteLogo?: string;
  
  // Şirket Bilgileri
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyFounder?: string;
  companyFoundedYear?: number;
  companyTaxNumber?: string;
  companyTradeRegistryNumber?: string;
  
  // SEO
  googleMapsLink?: string;
  metaKeywords?: string[];
  metaDescription?: string;
  
  // SMTP Ayarları
  smtp?: {
    host: string;
    port: number;
    secure: boolean;
    user: string;
    password: string;
    fromEmail: string;
    fromName: string;
  };
  
  // Sosyal Medya
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({
    siteName: '',
    siteDescription: '',
    siteLogo: '',
    companyName: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyFounder: '',
    companyFoundedYear: undefined,
    companyTaxNumber: '',
    companyTradeRegistryNumber: '',
    googleMapsLink: '',
    metaKeywords: [],
    metaDescription: '',
    smtp: {
      host: '',
      port: 587,
      secure: false,
      user: '',
      password: '',
      fromEmail: '',
      fromName: '',
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: '',
    },
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getSettings();
      if (response.success && response.settings) {
        setSettings({
          siteName: response.settings.siteName || '',
          siteDescription: response.settings.siteDescription || '',
          siteLogo: response.settings.siteLogo || '',
          companyName: response.settings.companyName || '',
          companyAddress: response.settings.companyAddress || '',
          companyPhone: response.settings.companyPhone || '',
          companyEmail: response.settings.companyEmail || '',
          companyFounder: response.settings.companyFounder || '',
          companyFoundedYear: response.settings.companyFoundedYear || undefined,
          companyTaxNumber: response.settings.companyTaxNumber || '',
          companyTradeRegistryNumber: response.settings.companyTradeRegistryNumber || '',
          googleMapsLink: response.settings.googleMapsLink || '',
          metaKeywords: response.settings.metaKeywords || [],
          metaDescription: response.settings.metaDescription || '',
          smtp: response.settings.smtp || {
            host: '',
            port: 587,
            secure: false,
            user: '',
            password: '',
            fromEmail: '',
            fromName: '',
          },
          socialMedia: response.settings.socialMedia || {
            facebook: '',
            twitter: '',
            instagram: '',
            linkedin: '',
            youtube: '',
          },
        });
      }
    } catch (error) {
      console.error('Ayarlar yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validasyon
      const errors: string[] = [];
      
      if (!settings.siteName || settings.siteName.trim() === '') {
        errors.push('Site Adı');
      }
      if (!settings.companyName || settings.companyName.trim() === '') {
        errors.push('Şirket Adı');
      }
      if (!settings.companyEmail || settings.companyEmail.trim() === '') {
        errors.push('E-posta');
      }
      if (!settings.companyPhone || settings.companyPhone.trim() === '') {
        errors.push('Telefon');
      }
      if (!settings.companyAddress || settings.companyAddress.trim() === '') {
        errors.push('Adres');
      }
      
      if (errors.length > 0) {
        await Swal.fire({
          icon: 'error',
          title: 'Eksik Bilgiler!',
          html: `Lütfen aşağıdaki zorunlu alanları doldurun:<br><br><strong>${errors.join('<br>')}</strong>`,
          confirmButtonColor: '#1f2937',
        });
        setSaving(false);
        return;
      }
      
      const response = await apiClient.updateSettings(settings);
      if (response.success) {
        await Swal.fire({
          icon: 'success',
          title: 'Başarılı!',
          text: 'Ayarlar başarıyla kaydedildi.',
          timer: 2000,
          showConfirmButton: false,
          toast: true,
          position: 'top-end',
        });
      }
    } catch (error: any) {
      let errorMessage = 'Ayarlar kaydedilirken bir hata oluştu';
      let validationErrors: string[] = [];
      
      // API'den gelen validation hatalarını kontrol et
      if (error.validationErrors && Array.isArray(error.validationErrors)) {
        validationErrors = error.validationErrors;
      }
      
      // API'den gelen hata mesajını kontrol et
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Eğer validation hataları varsa, onları göster
      if (validationErrors.length > 0) {
        errorMessage = `Aşağıdaki alanlarda hata var:<br><br><strong>${validationErrors.join('<br>')}</strong>`;
      } else {
        // Hata mesajında alan isimlerini kontrol et
        const fieldMap: Record<string, string> = {
          'siteName': 'Site Adı',
          'companyName': 'Şirket Adı',
          'companyEmail': 'E-posta',
          'companyPhone': 'Telefon',
          'companyAddress': 'Adres',
        };
        
        Object.keys(fieldMap).forEach((key) => {
          if (errorMessage.toLowerCase().includes(key.toLowerCase()) || 
              errorMessage.includes(fieldMap[key])) {
            if (!validationErrors.includes(fieldMap[key])) {
              validationErrors.push(fieldMap[key]);
            }
          }
        });
        
        if (validationErrors.length > 0) {
          errorMessage = `Aşağıdaki alanlarda hata var:<br><br><strong>${validationErrors.join('<br>')}</strong>`;
        }
      }
      
      await Swal.fire({
        icon: 'error',
        title: 'Hata!',
        html: errorMessage,
        confirmButtonColor: '#1f2937',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setSettings({ ...settings, [field]: value });
  };

  const updateSmtpField = (field: string, value: any) => {
    setSettings({
      ...settings,
      smtp: { ...settings.smtp!, [field]: value }
    });
  };

  const updateSocialMediaField = (field: string, value: string) => {
    setSettings({
      ...settings,
      socialMedia: { ...settings.socialMedia!, [field]: value }
    });
  };

  const addMetaKeyword = (keyword: string) => {
    if (keyword.trim() && !settings.metaKeywords?.includes(keyword.trim())) {
      setSettings({
        ...settings,
        metaKeywords: [...(settings.metaKeywords || []), keyword.trim()]
      });
    }
  };

  const removeMetaKeyword = (index: number) => {
    const newKeywords = [...(settings.metaKeywords || [])];
    newKeywords.splice(index, 1);
    setSettings({ ...settings, metaKeywords: newKeywords });
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
        <h1 style={{ fontSize: '24px', color: '#1f2937', fontWeight: '600', margin: 0, letterSpacing: '-0.5px' }}>Ayarlar</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: saving ? '#9ca3af' : '#1f2937',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '6px',
            cursor: saving ? 'not-allowed' : 'pointer',
            fontWeight: '500',
            fontSize: '14px',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            if (!saving) {
              e.currentTarget.style.background = '#374151';
            }
          }}
          onMouseLeave={(e) => {
            if (!saving) {
              e.currentTarget.style.background = '#1f2937';
            }
          }}
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
        {/* Genel Ayarlar */}
        <div style={{ 
          background: '#ffffff', 
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#1f2937', fontWeight: '600', letterSpacing: '-0.01em' }}>
            Genel Ayarlar
          </h2>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                Site Adı <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={settings.siteName}
                onChange={(e) => updateField('siteName', e.target.value)}
                required
                placeholder="Site adını girin"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                Site Açıklaması
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) => updateField('siteDescription', e.target.value)}
                rows={3}
                placeholder="Site açıklaması"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                Site Logo URL
              </label>
              <input
                type="text"
                value={settings.siteLogo || ''}
                onChange={(e) => updateField('siteLogo', e.target.value)}
                placeholder="/uploads/logo.png veya URL"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>
        </div>

        {/* Şirket Bilgileri */}
        <div style={{ 
          background: '#f9fafb', 
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#1f2937', fontWeight: '600', letterSpacing: '-0.01em' }}>
            Şirket Bilgileri
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                Şirket Adı <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => updateField('companyName', e.target.value)}
                required
                placeholder="Şirket adı"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                Kurucu
              </label>
              <input
                type="text"
                value={settings.companyFounder || ''}
                onChange={(e) => updateField('companyFounder', e.target.value)}
                placeholder="Kurucu adı"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                Kuruluş Yılı
              </label>
              <input
                type="number"
                value={settings.companyFoundedYear || ''}
                onChange={(e) => updateField('companyFoundedYear', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="2024"
                min="1900"
                max="2100"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                Vergi Numarası
              </label>
              <input
                type="text"
                value={settings.companyTaxNumber || ''}
                onChange={(e) => updateField('companyTaxNumber', e.target.value)}
                placeholder="Vergi numarası"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                Ticaret Sicil No
              </label>
              <input
                type="text"
                value={settings.companyTradeRegistryNumber || ''}
                onChange={(e) => updateField('companyTradeRegistryNumber', e.target.value)}
                placeholder="Ticaret sicil numarası"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                E-posta <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="email"
                value={settings.companyEmail}
                onChange={(e) => updateField('companyEmail', e.target.value)}
                required
                placeholder="info@example.com"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                Telefon <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input
                type="tel"
                value={settings.companyPhone}
                onChange={(e) => updateField('companyPhone', e.target.value)}
                required
                placeholder="+90 (212) 123 45 67"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                Adres <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                value={settings.companyAddress}
                onChange={(e) => updateField('companyAddress', e.target.value)}
                required
                rows={3}
                placeholder="Şirket adresi"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>
        </div>

        {/* SEO Ayarları */}
        <div style={{ 
          background: '#ffffff', 
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#1f2937', fontWeight: '600' }}>
            SEO Ayarları
          </h2>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                Google Maps Linki
              </label>
              <input
                type="url"
                value={settings.googleMapsLink || ''}
                onChange={(e) => updateField('googleMapsLink', e.target.value)}
                placeholder="https://maps.google.com/..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                Meta Açıklama
              </label>
              <textarea
                value={settings.metaDescription || ''}
                onChange={(e) => updateField('metaDescription', e.target.value)}
                rows={3}
                placeholder="SEO için meta açıklama"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                Meta Anahtar Kelimeler
              </label>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  placeholder="Anahtar kelime ekle"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.currentTarget as HTMLInputElement;
                      if (input.value.trim()) {
                        addMetaKeyword(input.value);
                        input.value = '';
                      }
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px',
                    transition: 'border-color 0.15s',
                    background: '#ffffff'
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                  onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
                />
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {settings.metaKeywords?.map((keyword, index) => (
                  <span
                    key={index}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 10px',
                      background: '#f3f4f6',
                      borderRadius: '6px',
                      fontSize: '13px',
                      color: '#1f2937'
                    }}
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => removeMetaKeyword(index)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '0',
                        fontSize: '16px',
                        lineHeight: '1',
                        fontWeight: 'bold'
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SMTP Ayarları */}
        <div style={{ 
          background: '#f9fafb', 
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#1f2937', fontWeight: '600', letterSpacing: '-0.01em' }}>
            SMTP Ayarları (E-posta)
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                SMTP Host
              </label>
              <input
                type="text"
                value={settings.smtp?.host || ''}
                onChange={(e) => updateSmtpField('host', e.target.value)}
                placeholder="smtp.gmail.com"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                SMTP Port
              </label>
              <input
                type="number"
                value={settings.smtp?.port || 587}
                onChange={(e) => updateSmtpField('port', parseInt(e.target.value) || 587)}
                placeholder="587"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                SMTP Kullanıcı Adı
              </label>
              <input
                type="text"
                value={settings.smtp?.user || ''}
                onChange={(e) => updateSmtpField('user', e.target.value)}
                placeholder="kullanici@example.com"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                SMTP Şifre
              </label>
              <input
                type="password"
                value={settings.smtp?.password || ''}
                onChange={(e) => updateSmtpField('password', e.target.value)}
                placeholder="SMTP şifresi"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                Gönderen E-posta
              </label>
              <input
                type="email"
                value={settings.smtp?.fromEmail || ''}
                onChange={(e) => updateSmtpField('fromEmail', e.target.value)}
                placeholder="noreply@example.com"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                Gönderen Adı
              </label>
              <input
                type="text"
                value={settings.smtp?.fromName || ''}
                onChange={(e) => updateSmtpField('fromName', e.target.value)}
                placeholder="Şirket Adı"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={settings.smtp?.secure || false}
                  onChange={(e) => updateSmtpField('secure', e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>SSL/TLS Kullan (Secure)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Sosyal Medya */}
        <div style={{ 
          background: '#ffffff', 
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#1f2937', fontWeight: '600', letterSpacing: '-0.01em' }}>
            Sosyal Medya
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                Facebook
              </label>
              <input
                type="url"
                value={settings.socialMedia?.facebook || ''}
                onChange={(e) => updateSocialMediaField('facebook', e.target.value)}
                placeholder="https://facebook.com/..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                Twitter
              </label>
              <input
                type="url"
                value={settings.socialMedia?.twitter || ''}
                onChange={(e) => updateSocialMediaField('twitter', e.target.value)}
                placeholder="https://twitter.com/..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                Instagram
              </label>
              <input
                type="url"
                value={settings.socialMedia?.instagram || ''}
                onChange={(e) => updateSocialMediaField('instagram', e.target.value)}
                placeholder="https://instagram.com/..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                LinkedIn
              </label>
              <input
                type="url"
                value={settings.socialMedia?.linkedin || ''}
                onChange={(e) => updateSocialMediaField('linkedin', e.target.value)}
                placeholder="https://linkedin.com/..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1f2937', fontSize: '14px' }}>
                YouTube
              </label>
              <input
                type="url"
                value={settings.socialMedia?.youtube || ''}
                onChange={(e) => updateSocialMediaField('youtube', e.target.value)}
                placeholder="https://youtube.com/..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '14px',
                  transition: 'border-color 0.15s',
                  background: '#ffffff'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#9ca3af'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
