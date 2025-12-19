import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Content from '@/models/Content';
import { getAuthUser } from '@/lib/auth';

// Default içerikleri oluştur
async function initializeDefaultContents() {
  try {
    const contentCount = await Content.countDocuments();
    
    if (contentCount === 0) {
      const defaultContents = [
        {
          slug: 'hakkimizda',
          title: 'Hakkımızda',
          description: 'Şirketimiz hakkında bilgiler',
          content: '<h2>Hakkımızda</h2><p>Şirketimiz hakkında detaylı bilgiler burada yer alacaktır.</p>',
          type: 'page' as const,
          isActive: true,
          order: 0,
        },
        {
          slug: 'hizmetlerimiz',
          title: 'Hizmetlerimiz',
          description: 'Sunduğumuz hizmetler',
          content: '<h2>Hizmetlerimiz</h2><p>Şirketimizin sunduğu hizmetler burada yer alacaktır.</p>',
          type: 'page' as const,
          isActive: true,
          order: 1,
        },
        {
          slug: 'haberler',
          title: 'Haberler',
          description: 'Güncel haberler ve duyurular',
          content: '<h2>Haberler</h2><p>Güncel haberler ve duyurular burada yer alacaktır.</p>',
          type: 'page' as const,
          isActive: true,
          order: 2,
        },
        {
          slug: 'iletisim',
          title: 'İletişim',
          description: 'Bizimle iletişime geçin',
          content: '<h2>İletişim</h2><p>Bizimle iletişime geçmek için aşağıdaki bilgileri kullanabilirsiniz.</p>',
          type: 'page' as const,
          isActive: true,
          order: 3,
        },
        {
          slug: 'gizlilik-politikasi',
          title: 'Gizlilik Politikası',
          description: 'Gizlilik politikamız',
          content: '<h2>Gizlilik Politikası</h2><p>Gizlilik politikamız hakkında detaylı bilgiler burada yer alacaktır.</p>',
          type: 'page' as const,
          isActive: true,
          order: 4,
        },
        {
          slug: 'kullanim-kosullari',
          title: 'Kullanım Koşulları',
          description: 'Kullanım koşullarımız',
          content: '<h2>Kullanım Koşulları</h2><p>Kullanım koşullarımız hakkında detaylı bilgiler burada yer alacaktır.</p>',
          type: 'page' as const,
          isActive: true,
          order: 5,
        },
        {
          slug: 'kvkk',
          title: 'KVKK',
          description: 'Kişisel Verilerin Korunması Kanunu',
          content: '<h2>KVKK</h2><p>Kişisel Verilerin Korunması Kanunu kapsamında bilgilendirme metni burada yer alacaktır.</p>',
          type: 'page' as const,
          isActive: true,
          order: 6,
        },
      ];

      await Content.insertMany(defaultContents);
      console.log('✅ Varsayılan içerikler oluşturuldu');
    }
  } catch (error: any) {
    console.error('❌ Varsayılan içerik oluşturma hatası:', error.message);
  }
}

// GET - İçerikleri getir
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Varsayılan içerikleri kontrol et ve oluştur
    await initializeDefaultContents();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const slug = searchParams.get('slug');
    const categoryId = searchParams.get('categoryId');

    const query: any = {};
    if (type) query.type = type;
    if (slug) query.slug = slug;
    if (categoryId) query.categoryId = categoryId;
    
    // Public API için sadece aktif içerikleri göster
    const isPublic = !getAuthUser(request);
    if (isPublic) {
      query.isActive = true;
    }

    const contents = await Content.find(query).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({ success: true, contents });
  } catch (error: any) {
    console.error('Get contents error:', error);
    return NextResponse.json(
      { error: error.message || 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// POST - Yeni içerik oluştur
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    await connectDB();

    const data = await request.json();
    
    // Slug yoksa title'dan otomatik oluştur
    if (!data.slug && data.title) {
      data.slug = data.title
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      // Eğer slug hala boşsa veya sadece tire ise, timestamp ekle
      if (!data.slug || data.slug === '-') {
        data.slug = `content-${Date.now()}`;
      } else {
        // Unique slug oluştur (eğer varsa sonuna sayı ekle)
        let baseSlug = data.slug;
        let counter = 1;
        while (await Content.findOne({ slug: data.slug })) {
          data.slug = `${baseSlug}-${counter}`;
          counter++;
        }
      }
    }
    
    // Sections'ı temizle
    if (data.sections && Array.isArray(data.sections)) {
      data.sections = data.sections.map((section: any, index: number) => {
        const cleaned: any = {
          type: section.type,
          order: index
        };
        
        if (section.type === 'component') {
          cleaned.componentId = section.componentId || '';
        }
        
        if (section.type === 'text') {
          cleaned.content = section.content || '';
        } else if (section.type === 'card') {
          // contentIds varsa onu kullan, yoksa contentId'yi array'e çevir
          if (section.contentIds && Array.isArray(section.contentIds) && section.contentIds.length > 0) {
            cleaned.contentIds = section.contentIds;
          } else if (section.contentId) {
            cleaned.contentIds = [section.contentId];
          } else {
            cleaned.contentIds = [];
          }
        }
        
        return cleaned;
      });
    }
    
    // Content field'ını her zaman ayarla (sections varsa bile)
    // Eğer sections varsa, content'i boş yap (sections kullanılacak)
    if (data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
      data.content = '';
    } else {
      // Sections yoksa, content'i kontrol et
      if (data.content === undefined || data.content === null) {
        data.content = '';
      }
    }
    
    // Content field'ını her zaman string olarak ayarla (undefined/null olamaz)
    data.content = data.content || '';
    
    try {
      const content = await Content.create(data);
      return NextResponse.json({ success: true, content }, { status: 201 });
    } catch (createError: any) {
      console.error('Mongoose create error:', createError);
      if (createError.code === 11000) {
        return NextResponse.json(
          { success: false, error: 'Bu slug zaten kullanılıyor' },
          { status: 400 }
        );
      }
      throw createError;
    }
  } catch (error: any) {
    console.error('Create content error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
