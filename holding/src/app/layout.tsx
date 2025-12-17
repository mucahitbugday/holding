import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import connectDB from '@/lib/mongodb';
import Settings from '@/models/Settings';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    await connectDB();
    const settings = await Settings.findOne();
    
    const siteName = settings?.siteName || 'Holding Şirketi';
    const siteDescription = settings?.siteDescription || settings?.metaDescription || 'Dünya standartlarında hizmet anlayışı ile sektörde öncü konumdayız. Entegre tesis yönetimi, güvenlik, temizlik ve teknoloji çözümleri sunuyoruz.';
    const keywords = settings?.metaKeywords?.join(', ') || 'tesis yönetimi, güvenlik hizmetleri, temizlik hizmetleri, teknoloji çözümleri, holding şirketi';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com';
    const logo = settings?.siteLogo || `${siteUrl}/images/logo.png`;

    return {
      metadataBase: new URL(siteUrl),
      title: {
        default: siteName,
        template: `%s | ${siteName}`,
      },
      description: siteDescription,
      keywords: keywords.split(', '),
      authors: [{ name: settings?.companyName || siteName }],
      creator: settings?.companyName || siteName,
      publisher: settings?.companyName || siteName,
      formatDetection: {
        email: false,
        address: false,
        telephone: false,
      },
      openGraph: {
        type: 'website',
        locale: 'tr_TR',
        url: siteUrl,
        siteName: siteName,
        title: siteName,
        description: siteDescription,
        images: [
          {
            url: logo,
            width: 1200,
            height: 630,
            alt: siteName,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: siteName,
        description: siteDescription,
        images: [logo],
        creator: settings?.socialMedia?.twitter ? `@${settings.socialMedia.twitter.replace('https://twitter.com/', '').replace('@', '')}` : undefined,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      alternates: {
        canonical: siteUrl,
      },
      verification: {
        google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
        yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
        yahoo: process.env.NEXT_PUBLIC_YAHOO_VERIFICATION,
      },
    };
  } catch (error) {
    console.error('Metadata generation error:', error);
    // Fallback metadata
    return {
      title: 'Holding Şirketi',
      description: 'Dünya standartlarında hizmet anlayışı ile sektörde öncü konumdayız.',
      keywords: ['holding', 'şirket', 'hizmet'],
    };
  }
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className={`${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
