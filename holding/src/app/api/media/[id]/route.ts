import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Media from '@/models/Media';
import { getAuthUser } from '@/lib/auth';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// DELETE - Medya dosyasını sil
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

    const media = await Media.findById(id);
    if (!media) {
      return NextResponse.json(
        { error: 'Dosya bulunamadı' },
        { status: 404 }
      );
    }

    // Dosyayı fiziksel olarak sil
    const filepath = join(process.cwd(), 'public', media.url);
    if (existsSync(filepath)) {
      try {
        await unlink(filepath);
      } catch (error) {
        console.error('Dosya silinirken hata:', error);
        // Dosya silinemese bile veritabanından sil
      }
    }

    // Veritabanından sil
    await Media.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Dosya silindi' });
  } catch (error: any) {
    console.error('Delete media error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
