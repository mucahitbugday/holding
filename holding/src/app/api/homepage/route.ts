import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import HomePageSettings from '@/models/HomePageSettings';
import { getAuthUser } from '@/lib/auth';

// GET - Anasayfa ayarlarını getir
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Tek bir kayıt olacak (singleton)
    let settings = await HomePageSettings.findOne();

    // Eğer kayıt yoksa varsayılan ayarları oluştur
    if (!settings) {
      settings = await HomePageSettings.create({
        sections: [
          {
            type: 'hero',
            order: 0,
            isActive: true,
            data: {
              slides: [
                {
                  title: 'Dünya Standartlarında Hizmet',
                  description: 'Sektörümüzle ilgili dünyadaki gelişmeleri takip ediyor ve işimizi sürekli olarak geliştiriyoruz.',
                  link: '#hizmetler',
                  linkText: 'Hizmetlerimiz',
                  image: '/images/slide1.jpg',
                  order: 0,
                },
              ],
            },
          },
        ],
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Get homepage settings error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// PUT - Anasayfa ayarlarını güncelle
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

    // Tek bir kayıt olacak, varsa güncelle yoksa oluştur
    let settings = await HomePageSettings.findOne();

    if (settings) {
      settings.sections = data.sections || settings.sections;
      await settings.save();
    } else {
      settings = await HomePageSettings.create({
        sections: data.sections || [],
      });
    }

    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    console.error('Update homepage settings error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
