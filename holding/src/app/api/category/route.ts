import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Category from '@/models/Category';
import { getAuthUser } from '@/lib/auth';

// GET - Kategorileri getir
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive');

    const query: any = {};
    if (isActive !== null) {
      query.isActive = isActive === 'true';
    }

    const categories = await Category.find(query).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({ success: true, categories });
  } catch (error: any) {
    console.error('Get categories error:', error);
    return NextResponse.json(
      { error: error.message || 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// POST - Yeni kategori oluştur
export async function POST(request: NextRequest) {
  try {
    const user = getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    await connectDB();

    const data = await request.json();

    // Slug oluştur (eğer yoksa name'den)
    if (!data.slug && data.name) {
      data.slug = data.name
        .toLowerCase()
        .replace(/ğ/g, 'g')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    }

    try {
      const category = await Category.create(data);
      return NextResponse.json({ success: true, category }, { status: 201 });
    } catch (createError: any) {
      console.error('Mongoose create error:', createError);
      if (createError.code === 11000) {
        return NextResponse.json(
          { success: false, error: 'Bu slug zaten kullanılıyor' },
          { status: 400 }
        );
      }
      throw createError;
    }
  } catch (error: any) {
    console.error('Create category error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
