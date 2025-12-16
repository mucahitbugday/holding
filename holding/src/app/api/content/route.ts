import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Content from '@/models/Content';
import { getAuthUser } from '@/lib/auth';

// GET - İçerikleri getir
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const slug = searchParams.get('slug');

    const query: any = {};
    if (type) query.type = type;
    if (slug) query.slug = slug;
    
    // Public API için sadece aktif içerikleri göster
    const isPublic = !getAuthUser(request);
    if (isPublic) {
      query.isActive = true;
    }

    const contents = await Content.find(query).sort({ order: 1, createdAt: -1 });

    return NextResponse.json({ success: true, contents });
  } catch (error) {
    console.error('Get contents error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// POST - Yeni içerik oluştur
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
    const content = await Content.create(data);

    return NextResponse.json({ success: true, content }, { status: 201 });
  } catch (error: any) {
    console.error('Create content error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
