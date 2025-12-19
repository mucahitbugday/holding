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
          {
            type: 'about',
            order: 1,
            isActive: true,
            data: {
              title: 'Hakkımızda',
              description: 'Şirketimiz hakkında bilgiler',
              items: [
                {
                  title: 'Vizyonumuz',
                  description: 'Sektörde öncü olmak ve müşterilerimize en iyi hizmeti sunmak',
                  icon: 'fas fa-eye',
                  order: 0,
                },
                {
                  title: 'Misyonumuz',
                  description: 'Kaliteli hizmet anlayışı ile müşteri memnuniyetini sağlamak',
                  icon: 'fas fa-bullseye',
                  order: 1,
                },
              ],
            },
          },
          {
            type: 'services',
            order: 2,
            isActive: true,
            data: {
              servicesTitle: 'Hizmetlerimiz',
              servicesDescription: 'Geniş hizmet yelpazemizle ihtiyaçlarınıza çözüm üretiyoruz',
              services: [
                {
                  icon: 'fas fa-laptop-code',
                  title: 'Teknoloji',
                  description: 'Modern teknoloji çözümleri ile işletmenizi geleceğe taşıyoruz.',
                  order: 0,
                },
                {
                  icon: 'fas fa-building',
                  title: 'Entegre Tesis Yönetimi',
                  description: 'Tesislerinizin tüm yönetim ihtiyaçlarını tek çatı altında topluyoruz.',
                  order: 1,
                },
                {
                  icon: 'fas fa-shield-alt',
                  title: 'Güvenlik',
                  description: 'Profesyonel güvenlik hizmetleri ile tesislerinizi koruyoruz.',
                  order: 2,
                },
              ],
            },
          },
          {
            type: 'hrpolicy',
            order: 3,
            isActive: true,
            data: {
              hrTitle: 'İK Politikamız',
              subtitle: 'İnsan Odaklı Yaklaşım',
              hrDescription: 'İnsana değer veriyoruz. Yaptığımız iş ne olursa olsun merkezinde insan var. Bu bilinçle insan ve çözüm odaklı bir yaklaşım benimsiyoruz.',
              links: [
                { text: 'İK Politikamız', href: '#ik-politika', order: 0 },
                { text: 'Kariyer Planlama', href: '#kariyer', order: 1 },
                { text: 'Açık Pozisyonlar & Başvuru', href: '#pozisyonlar', order: 2 },
              ],
              image: '/images/hr-policy.jpg',
            },
          },
          {
            type: 'news',
            order: 4,
            isActive: true,
            data: {
              sectionTitle: 'Haberler',
              sectionDescription: 'Sektöre dair tüm gelişmeler ve en güncel haberleri bu sayfadan takip edebilirsiniz.',
              news: [
                {
                  day: '29',
                  month: 'Oca',
                  title: 'Yeni Proje Başarıyla Tamamlandı',
                  description: 'Büyük ölçekli bir projeyi başarıyla tamamladık ve müşterilerimize teslim ettik.',
                  link: '#',
                  order: 0,
                },
                {
                  day: '06',
                  month: 'Şub',
                  title: 'Yeni Ofis Açılışı',
                  description: 'Büyüyen iş hacmimiz nedeniyle yeni ofisimizi açtık.',
                  link: '#',
                  order: 1,
                },
              ],
            },
          },
          {
            type: 'contact',
            order: 5,
            isActive: true,
            data: {
              contactTitle: 'İletişim',
              contactDescription: 'Bizimle iletişime geçmek için aşağıdaki bilgileri kullanabilirsiniz.',
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
    const user = await getAuthUser(request);
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
      // Mevcut kaydı güncelle
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
    
    // Validation hatası ise detaylı mesaj döndür
    if (error.name === 'ValidationError') {
      const validationErrors: string[] = [];
      if (error.errors) {
        Object.keys(error.errors).forEach((key) => {
          validationErrors.push(`${key}: ${error.errors[key].message}`);
        });
      }
      return NextResponse.json(
        { 
          success: false,
          error: 'Validation hatası',
          details: validationErrors.length > 0 ? validationErrors : [error.message]
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Sunucu hatası' 
      },
      { status: 500 }
    );
  }
}
