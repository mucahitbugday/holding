import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Menu from '@/models/Menu';
import { getAuthUser } from '@/lib/auth';

// GET - Menüleri getir
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const query: any = { isActive: true };
    if (type) {
      query.type = type;
    }

    const menus = await Menu.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, menus });
  } catch (error) {
    console.error('Get menus error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// POST - Yeni menü oluştur
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
    const menu = await Menu.create(data);

    return NextResponse.json({ success: true, menu }, { status: 201 });
  } catch (error: any) {
    console.error('Create menu error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Bu menü adı zaten kullanılıyor' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
