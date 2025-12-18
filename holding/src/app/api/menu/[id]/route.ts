import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Menu from '@/models/Menu';
import { getAuthUser } from '@/lib/auth';

// GET - Tek menü getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const menu = await Menu.findById(id);

    if (!menu) {
      return NextResponse.json(
        { error: 'Menü bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, menu });
  } catch (error: any) {
    console.error('Get menu error:', error);
    // Invalid ObjectId kontrolü
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Geçersiz menü ID' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// PUT - Menü güncelle
export async function PUT(
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

    const data = await request.json();
    
    // Frontend'de kontrol yapılıyor, burada sadece güncelle
    const menu = await Menu.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );

    if (!menu) {
      return NextResponse.json(
        { error: 'Menü bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, menu });
  } catch (error: any) {
    console.error('Update menu error:', error);
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Bu menü adı zaten kullanılıyor' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// DELETE - Menü sil
export async function DELETE(
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

    const menu = await Menu.findByIdAndDelete(id);

    if (!menu) {
      return NextResponse.json(
        { error: 'Menü bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'Menü silindi' });
  } catch (error: any) {
    console.error('Delete menu error:', error);
    // Invalid ObjectId kontrolü
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Geçersiz menü ID' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
