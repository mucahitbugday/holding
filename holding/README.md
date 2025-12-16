# Holding Şirketi - Next.js CMS Projesi

Bu proje, MongoDB backend ve Next.js frontend kullanan bir içerik yönetim sistemidir.

## Özellikler

### Frontend
- ✅ Responsive tasarım (mobil uyumlu)
- ✅ SEO optimizasyonu
- ✅ Modern React/Next.js yapısı
- ✅ TypeScript desteği
- ✅ Dinamik menü yönetimi
- ✅ Dinamik içerik yönetimi

### Backend
- ✅ MongoDB veritabanı
- ✅ JWT tabanlı kimlik doğrulama
- ✅ Şifre sıfırlama (email ile kod gönderme)
- ✅ Admin paneli
- ✅ RESTful API

### Admin Panel
- ✅ Menü yönetimi (Ana menü, alt menüler, sıralama)
- ✅ İçerik yönetimi (Sayfa içerikleri, hizmetler, haberler)
- ✅ Kullanıcı yönetimi
- ✅ Şifre sıfırlama

## Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Ortam Değişkenlerini Ayarlayın

`.env.local` dosyası oluşturun:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/holding

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@holding.com.tr

# Next.js Public URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. MongoDB'yi Başlatın

MongoDB'nin çalıştığından emin olun. Eğer yüklü değilse:

```bash
# Windows için MongoDB Community Server indirin ve yükleyin
# https://www.mongodb.com/try/download/community
```

### 4. Geliştirme Sunucusunu Başlatın

```bash
npm run dev
```

Proje `http://localhost:3000` adresinde çalışacaktır.

## Kullanım

### İlk Kullanıcı Kaydı

1. `/admin/register` sayfasına gidin
2. İlk kayıt olan kullanıcı otomatik olarak **admin** rolü alır
3. Giriş yapın ve admin paneline erişin

### Admin Paneli

- **Dashboard**: `/admin/dashboard`
- **Menü Yönetimi**: `/admin/dashboard/menus`
- **İçerik Yönetimi**: `/admin/dashboard/contents`

### Menü Yönetimi

1. Menü ekleyin (Ana Menü, Footer, Sidebar)
2. Menü öğeleri ekleyin (Label, Href, Sıra)
3. Alt menüler ekleyin (her menü öğesine alt menü eklenebilir)
4. Menü sırasını `order` alanı ile belirleyin
5. Menüleri aktif/pasif yapabilirsiniz

### İçerik Yönetimi

1. İçerik ekleyin (Slug, Başlık, Açıklama, İçerik)
2. İçerik tipini seçin (page, section, hero, about, service, news, footer)
3. İçerikleri aktif/pasif yapabilirsiniz
4. İçerik sırasını `order` alanı ile belirleyin

### Şifre Sıfırlama

1. `/admin/forgot-password` sayfasına gidin
2. Email adresinizi girin
3. Email'inize gönderilen 6 haneli kodu alın
4. `/admin/reset-password` sayfasında kodu ve yeni şifrenizi girin

## API Endpoints

### Authentication
- `POST /api/auth/login` - Kullanıcı girişi
- `POST /api/auth/register` - Kullanıcı kaydı
- `POST /api/auth/forgot-password` - Şifre sıfırlama kodu gönder
- `POST /api/auth/reset-password` - Şifre sıfırla

### Menu
- `GET /api/menu?type=main` - Menüleri getir
- `POST /api/menu` - Yeni menü oluştur (admin)
- `PUT /api/menu/[id]` - Menü güncelle (admin)
- `DELETE /api/menu/[id]` - Menü sil (admin)

### Content
- `GET /api/content?type=service` - İçerikleri getir
- `POST /api/content` - Yeni içerik oluştur (admin)
- `PUT /api/content/[id]` - İçerik güncelle (admin)
- `DELETE /api/content/[id]` - İçerik sil (admin)

## Veritabanı Modelleri

### User
- email, password, name, role
- resetPasswordToken, resetPasswordExpires

### Menu
- name, type (main/footer/sidebar)
- items (array of MenuItem)
- isActive

### Content
- slug, title, description, content
- type (page/section/hero/about/service/news/footer)
- isActive, order

### ResetCode
- email, code, expiresAt, used

## Proje Yapısı

```
holding/
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── admin/        # Admin panel sayfaları
│   │   └── page.tsx      # Ana sayfa
│   ├── components/       # React bileşenleri
│   ├── lib/              # Yardımcı fonksiyonlar
│   └── models/           # MongoDB modelleri
└── public/
    └── images/           # Görseller
```

## Production Build

```bash
npm run build
npm start
```

## Notlar

- İlk kullanıcı kaydı otomatik olarak admin rolü alır
- Şifre sıfırlama kodları 10 dakika geçerlidir
- Email gönderimi için SMTP ayarlarının doğru yapılması gerekir
- JWT token'lar 7 gün geçerlidir
- Menüler ve içerikler `order` alanına göre sıralanır

## Lisans

Bu proje özel bir projedir.
