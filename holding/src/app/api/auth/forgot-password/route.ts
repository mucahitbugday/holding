import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import ResetCode from '@/models/ResetCode';
import { sendPasswordResetCode } from '@/lib/email';

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email gereklidir' },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Güvenlik için kullanıcı olmasa bile başarılı mesaj döndür
      return NextResponse.json({
        success: true,
        message: 'Eğer bu email kayıtlıysa, şifre sıfırlama kodu gönderildi',
      });
    }

    // Eski kodları temizle
    await ResetCode.deleteMany({ email: email.toLowerCase(), used: false });

    // Yeni kod oluştur
    const code = generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // 10 dakika geçerli

    await ResetCode.create({
      email: email.toLowerCase(),
      code,
      expiresAt,
      used: false,
    });

    // Email gönder
    const emailSent = await sendPasswordResetCode(email, code);

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Email gönderilemedi. Lütfen daha sonra tekrar deneyin.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Şifre sıfırlama kodu email adresinize gönderildi',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
