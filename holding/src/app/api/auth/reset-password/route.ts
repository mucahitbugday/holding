import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import ResetCode from '@/models/ResetCode';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    try {
      await connectDB();
    } catch (dbError: any) {
      console.error('Database connection error:', dbError);
      return NextResponse.json(
        { 
          error: 'Veritabanı bağlantı hatası. Lütfen MongoDB sunucusunun çalıştığından ve .env.local dosyasındaki MONGODB_URI değerinin doğru olduğundan emin olun.',
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        },
        { status: 500 }
      );
    }

    const { email, code, newPassword } = await request.json();

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: 'Email, kod ve yeni şifre gereklidir' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    // Kodu kontrol et
    const resetCode = await ResetCode.findOne({
      email: email.toLowerCase(),
      code,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetCode) {
      return NextResponse.json(
        { error: 'Geçersiz veya süresi dolmuş kod' },
        { status: 400 }
      );
    }

    // Kullanıcıyı bul
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Şifreyi güncelle
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // Kodu kullanıldı olarak işaretle
    resetCode.used = true;
    await resetCode.save();

    return NextResponse.json({
      success: true,
      message: 'Şifre başarıyla sıfırlandı',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
