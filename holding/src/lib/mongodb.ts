import mongoose from 'mongoose';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || '';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
  initialized: boolean;
}

declare global {
  var mongoose: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongoose || { conn: null, promise: null, initialized: false };

if (!global.mongoose) {
  global.mongoose = cached;
}

async function initializeDefaultUser() {
  if (cached.initialized) {
    return;
  }

  try {
    const userCount = await User.countDocuments();
    
    if (userCount === 0) {
      const hashedPassword = await bcrypt.hash('lorasoft', 10);
      
      await User.create({
        email: 'admin@lorasoft.com',
        password: hashedPassword,
        name: 'Admin',
        role: 'admin',
      });
      
      console.log('✅ Varsayılan admin kullanıcısı oluşturuldu: admin@lorasoft.com');
    }
    
    cached.initialized = true;
  } catch (error: any) {
    console.error('❌ Varsayılan kullanıcı oluşturma hatası:', error.message);
    // Hata olsa bile devam et, kritik değil
  }
}

async function connectDB() {
  if (cached.conn) {
    // Bağlantı varsa ama initialization yapılmadıysa yap
    if (!cached.initialized) {
      await initializeDefaultUser();
    }
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // 5 saniye timeout
      socketTimeoutMS: 45000,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then(async (mongoose) => {
      console.log('✅ MongoDB bağlantısı başarılı');
      // Bağlantı başarılı olduktan sonra varsayılan kullanıcıyı kontrol et
      await initializeDefaultUser();
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
