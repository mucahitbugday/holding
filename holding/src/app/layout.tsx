import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Holding Şirketi - Ana Sayfa",
  description: "Dünya standartlarında hizmet anlayışı ile sektörde öncü konumdayız. Entegre tesis yönetimi, güvenlik, temizlik ve teknoloji çözümleri sunuyoruz.",
  keywords: "tesis yönetimi, güvenlik hizmetleri, temizlik hizmetleri, teknoloji çözümleri, holding şirketi",
  authors: [{ name: "Holding Şirketi" }],
  openGraph: {
    title: "Holding Şirketi - Ana Sayfa",
    description: "Dünya standartlarında hizmet anlayışı ile sektörde öncü konumdayız.",
    type: "website",
    locale: "tr_TR",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

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
