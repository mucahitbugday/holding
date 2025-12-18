import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Menu from '@/models/Menu';
import { getAuthUser } from '@/lib/auth';

// Default menüleri oluştur
async function initializeDefaultMenus() {
  try {
    let createdCount = 0;

    // Ana Menü kontrolü
    const mainMenu = await Menu.findOne({ name: 'Ana Menü' });
    if (!mainMenu) {
      try {
        await Menu.create({
          name: 'Ana Menü',
          type: 'main',
          isActive: true,
          items: [
            { label: 'Ana Sayfa', href: '/', order: 0 },
            { label: 'Hakkımızda', href: '/hakkimizda', order: 1 },
            { label: 'Hizmetlerimiz', href: '/hizmetlerimiz', order: 2 },
            { label: 'Haberler', href: '/haberler', order: 3 },
            { label: 'İletişim', href: '/iletisim', order: 4 },
          ],
        });
        createdCount++;
      } catch (error: any) {
        // Duplicate key hatası görmezden gel (zaten var demektir)
        if (error.code !== 11000) {
          console.error('❌ Ana Menü oluşturma hatası:', error.message);
        }
      }
    }

    // Footer Menü kontrolü
    const footerMenu = await Menu.findOne({ name: 'Footer Menü' });
    if (!footerMenu) {
      try {
        await Menu.create({
          name: 'Footer Menü',
          type: 'footer',
          isActive: true,
          items: [
            { label: 'Gizlilik Politikası', href: '/gizlilik-politikasi', order: 0 },
            { label: 'Kullanım Koşulları', href: '/kullanim-kosullari', order: 1 },
            { label: 'KVKK', href: '/kvkk', order: 2 },
          ],
        });
        createdCount++;
      } catch (error: any) {
        // Duplicate key hatası görmezden gel (zaten var demektir)
        if (error.code !== 11000) {
          console.error('❌ Footer Menü oluşturma hatası:', error.message);
        }
      }
    }

    if (createdCount > 0) {
      console.log(`✅ ${createdCount} varsayılan menü oluşturuldu`);
    }
  } catch (error: any) {
    console.error('❌ Varsayılan menü oluşturma hatası:', error.message);
  }
}

// GET - Menüleri getir
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Varsayılan menüleri kontrol et ve oluştur
    await initializeDefaultMenus();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const authUser = getAuthUser(request); // Admin kontrolü
    const isAdmin = authUser && authUser.role === 'admin';

    const query: any = {};
    
    // Eğer admin değilse sadece aktif menüleri göster
    if (!isAdmin) {
      query.isActive = true;
    }
    
    if (type) {
      query.type = type;
    }

    const menus = await Menu.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, menus });
  } catch (error: any) {
    console.error('Get menus error:', error);
    return NextResponse.json(
      { error: error.message || 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// POST - Yeni menü oluştur
export async function POST(request: NextRequest) {
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
    
    // Frontend'de kontrol yapılıyor, burada sadece oluştur
    const menu = await Menu.create(data);

    return NextResponse.json({ success: true, menu }, { status: 201 });
  } catch (error: any) {
    console.error('Create menu error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Bu menü adı zaten kullanılıyor' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
