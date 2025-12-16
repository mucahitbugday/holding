# Docker Deployment Guide

## Jenkins Shell Komutu

Jenkins'te shell komutunda şu komutu kullanın:

```bash
docker compose up -d --build
```

**Not:** `docker compose up -d build` komutu geçerli değildir. Doğru komut `docker compose up -d --build` şeklindedir.

## Environment Variables

Sunucuda `.env` dosyası oluşturun veya Jenkins'te environment variables olarak ayarlayın:

- `MONGODB_URI` - MongoDB bağlantı string'i
- `JWT_SECRET` - JWT token için secret key
- `SMTP_HOST` - SMTP sunucu adresi
- `SMTP_PORT` - SMTP port numarası
- `SMTP_USER` - SMTP kullanıcı adı
- `SMTP_PASS` - SMTP şifresi
- `SMTP_FROM` - Gönderen email adresi
- `NEXT_PUBLIC_APP_URL` - Uygulama URL'i (örn: http://yourdomain.com:8486)

## Port

Uygulama **8486** portunda çalışacak şekilde yapılandırılmıştır.

## Docker Compose Komutları

- **Başlatma:** `docker compose up -d --build`
- **Durdurma:** `docker compose down`
- **Logları görüntüleme:** `docker compose logs -f`
- **Yeniden başlatma:** `docker compose restart`
