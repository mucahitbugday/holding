import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET - Tek kullanıcı getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    const foundUser = await User.findById(id)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .lean();

    if (!foundUser) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user: foundUser });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// PUT - Kullanıcı güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    const data = await request.json();
    const { email, password, name, role, isActive } = data;

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    // Kendi hesabını silmeyi engelle
    if (id === authUser.id) {
      // Kendi hesabında role değişikliği yapılamaz
      if (role && role !== user.role) {
        return NextResponse.json(
          { error: 'Kendi hesabınızın yetkisini değiştiremezsiniz' },
          { status: 400 }
        );
      }
    }

    // Email güncelleme kontrolü
    if (email && email.toLowerCase() !== user.email) {
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Bu email adresi zaten kullanılıyor' },
          { status: 400 }
        );
      }
      user.email = email.toLowerCase();
    }

    // Diğer alanları güncelle
    if (name) user.name = name;
    if (role && id !== authUser.id) user.role = role; // Kendi hesabında role değiştirilemez
    if (isActive !== undefined && id !== authUser.id) user.isActive = isActive; // Kendi hesabını pasif yapamaz

    // Şifre güncelleme
    if (password && password.length > 0) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Şifre en az 6 karakter olmalıdır' },
          { status: 400 }
        );
      }
      user.password = await bcrypt.hash(password, 10);
    }

    await user.save();

    // Şifreyi response'dan çıkar
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.resetPasswordToken;
    delete userResponse.resetPasswordExpires;

    return NextResponse.json({ success: true, user: userResponse });
  } catch (error: any) {
    console.error('Update user error:', error);
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

// DELETE - Kullanıcı sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = getAuthUser(request);
    if (!authUser || authUser.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    // Kendi hesabını silmeyi engelle
    if (id === authUser.id) {
      return NextResponse.json(
        { error: 'Kendi hesabınızı silemezsiniz' },
        { status: 400 }
      );
    }

    const user = await User.findByIdAndDelete(id);
    if (!user) {
      return NextResponse.json(
        { error: 'Kullanıcı bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Kullanıcı silindi' });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
