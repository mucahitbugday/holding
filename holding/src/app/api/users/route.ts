import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET - Kullanıcıları getir
export async function GET(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    const query: any = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, users });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// POST - Yeni kullanıcı oluştur
export async function POST(request: NextRequest) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    await connectDB();

    const data = await request.json();
    const { email, password, name, role, isActive } = data;

    // Validasyon
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, şifre ve isim gereklidir' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Şifre en az 6 karakter olmalıdır' },
        { status: 400 }
      );
    }

    // Email kontrolü
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcıyı oluştur
    const user = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      role: role || 'user',
      isActive: isActive !== undefined ? isActive : true,
    });

    // Şifreyi response'dan çıkar
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.resetPasswordToken;
    delete userResponse.resetPasswordExpires;

    return NextResponse.json({ success: true, user: userResponse }, { status: 201 });
  } catch (error: any) {
    console.error('Create user error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanılıyor' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
