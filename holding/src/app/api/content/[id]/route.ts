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
  } catch (error: any) {
    console.error('Get content error:', error);
    // Invalid ObjectId kontrolü
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Geçersiz içerik ID' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Sunucu hatası' },
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
    
    // Sections'ı temizle
    if (data.sections && Array.isArray(data.sections)) {
      data.sections = data.sections.map((section: any, index: number) => {
        const cleaned: any = {
          type: section.type,
          order: index
        };
        
        if (section.type === 'text') {
          cleaned.content = section.content || '';
        } else if (section.type === 'card') {
          // contentIds varsa onu kullan, yoksa contentId'yi array'e çevir
          if (section.contentIds && Array.isArray(section.contentIds) && section.contentIds.length > 0) {
            cleaned.contentIds = section.contentIds;
          } else if (section.contentId) {
            cleaned.contentIds = [section.contentId];
          } else {
            cleaned.contentIds = [];
          }
        }
        
        return cleaned;
      });
    }
    
    // Content field'ını her zaman ayarla (sections varsa bile)
    // Eğer sections varsa, content'i boş yap (sections kullanılacak)
    if (data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
      data.content = '';
    } else {
      // Sections yoksa, content'i kontrol et
      if (data.content === undefined || data.content === null) {
        data.content = '';
      }
    }
    
    // Content field'ını her zaman string olarak ayarla (undefined/null olamaz)
    data.content = data.content || '';
    
    try {
      const content = await Content.findByIdAndUpdate(
        id,
        data,
        { new: true, runValidators: true }
      );

      if (!content) {
        return NextResponse.json(
          { success: false, error: 'İçerik bulunamadı' },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, content });
    } catch (updateError: any) {
      console.error('Mongoose update error:', updateError);
      if (updateError.code === 11000) {
        return NextResponse.json(
          { success: false, error: 'Bu slug zaten kullanılıyor' },
          { status: 400 }
        );
      }
      throw updateError;
    }
  } catch (error: any) {
    console.error('Update content error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Sunucu hatası' },
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
  } catch (error: any) {
    console.error('Delete content error:', error);
    // Invalid ObjectId kontrolü
    if (error.name === 'CastError') {
      return NextResponse.json(
        { error: 'Geçersiz içerik ID' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
