import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // 5 saniye timeout
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB bağlantısı başarılı');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e: any) {
    cached.promise = null;
    console.error('❌ MongoDB bağlantı hatası:', e.message);
    
    // Daha açıklayıcı hata mesajı
    if (e.message?.includes('ENOTFOUND')) {
      throw new Error(
        `MongoDB sunucusuna bağlanılamıyor. Lütfen .env.local dosyasındaki MONGODB_URI değerini kontrol edin. ` +
        `Hata: ${e.message}. ` +
        `Örnek format: mongodb://localhost:27017/veritabani-adi veya mongodb+srv://kullanici:sifre@cluster.mongodb.net/veritabani-adi`
      );
    }
    
    throw e;
  }

  return cached.conn;
}

export default connectDB;
