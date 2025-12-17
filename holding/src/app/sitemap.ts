import { MetadataRoute } from 'next';
import connectDB from '@/lib/mongodb';
import Content from '@/models/Content';
import Menu from '@/models/Menu';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
  
  try {
    await connectDB();

    // Ana sayfa
    const routes: MetadataRoute.Sitemap = [
      {
        url: siteUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];

    // Aktif içerikleri getir
    const contents = await Content.find({ isActive: true }).select('slug updatedAt').lean();
    
    contents.forEach((content: any) => {
      routes.push({
        url: `${siteUrl}/${content.slug}`,
        lastModified: content.updatedAt || content.createdAt || new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });

    // Menülerden linkleri çıkar
    const menus = await Menu.find({ isActive: true }).select('items').lean();
    
    menus.forEach((menu: any) => {
      if (menu.items && Array.isArray(menu.items)) {
        menu.items.forEach((item: any) => {
          if (item.href && item.href !== '/' && !item.href.startsWith('http')) {
            // Zaten eklenmiş mi kontrol et
            const exists = routes.some(route => route.url === `${siteUrl}${item.href}`);
            if (!exists) {
              routes.push({
                url: `${siteUrl}${item.href}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.6,
              });
            }
          }
        });
      }
    });

    return routes;
  } catch (error) {
    console.error('Sitemap generation error:', error);
    // Hata durumunda en azından ana sayfayı döndür
    return [
      {
        url: siteUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
    ];
  }
}
