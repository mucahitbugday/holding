import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';
import { getAuthUser } from '@/lib/auth';

// GET - Ayarları getir
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Singleton pattern - sadece bir settings kaydı olacak
    let settings = await Settings.findOne();

    // Eğer kayıt yoksa varsayılan ayarları oluştur
    if (!settings) {
      settings = await Settings.create({});
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// PUT - Ayarları güncelle
export async function PUT(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    await connectDB();

    const data = await request.json();

    // Singleton pattern - sadece bir settings kaydı olacak
    let settings = await Settings.findOne();

    if (settings) {
      // Mevcut ayarları güncelle
      Object.assign(settings, data);
      await settings.save();
    } else {
      // Yeni ayarlar oluştur
      settings = await Settings.create(data);
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Update settings error:', error);
    
    // Mongoose validation hatalarını parse et
    let errorMessage = error.message || 'Sunucu hatası';
    const validationErrors: string[] = [];
    
    if (error.name === 'ValidationError' && error.errors) {
      // Mongoose validation hatalarını topla
      Object.keys(error.errors).forEach((key) => {
        const fieldName = error.errors[key].path;
        // Alan adını Türkçe'ye çevir
        const fieldMap: Record<string, string> = {
          'siteName': 'Site Adı',
          'companyName': 'Şirket Adı',
          'companyEmail': 'E-posta',
          'companyPhone': 'Telefon',
          'companyAddress': 'Adres',
        };
        const turkishName = fieldMap[fieldName] || fieldName;
        if (!validationErrors.includes(turkishName)) {
          validationErrors.push(turkishName);
        }
      });
      
      if (validationErrors.length > 0) {
        errorMessage = `Aşağıdaki alanlarda hata var: ${validationErrors.join(', ')}`;
      }
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        validationErrors: validationErrors.length > 0 ? validationErrors : undefined
      },
      { status: 500 }
    );
  }
}
