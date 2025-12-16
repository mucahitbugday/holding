import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Content from '@/models/Content';
import { getAuthUser } from '@/lib/auth';

// GET - Tek içerik getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const content = await Content.findById(id);

    if (!content) {
      return NextResponse.json(
        { error: 'İçerik bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error('Get content error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// PUT - İçerik güncelle
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
    const content = await Content.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );

    if (!content) {
      return NextResponse.json(
        { error: 'İçerik bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, content });
  } catch (error) {
    console.error('Update content error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// DELETE - İçerik sil
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

    const content = await Content.findByIdAndDelete(id);

    if (!content) {
      return NextResponse.json(
        { error: 'İçerik bulunamadı' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: 'İçerik silindi' });
  } catch (error) {
    console.error('Delete content error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
