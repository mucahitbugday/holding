import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Media from '@/models/Media';
import { getAuthUser } from '@/lib/auth';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// GET - Medya dosyalarını getir
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'image' | 'pdf' | null

    const query: any = {};
    if (type) {
      query.type = type;
    }

    const mediaFiles = await Media.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, files: mediaFiles });
  } catch (error) {
    console.error('Get media error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}

// POST - Yeni medya dosyası yükle
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

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'Dosya seçilmedi' },
        { status: 400 }
      );
    }

    const uploadDir = join(process.cwd(), 'public', 'uploads');
    
    // Upload klasörü yoksa oluştur
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadedFiles = [];

    for (const file of files) {
      // Dosya tipini kontrol et
      const mimeType = file.type;
      let fileType: 'image' | 'pdf' | 'other' = 'other';
      
      if (mimeType.startsWith('image/')) {
        fileType = 'image';
      } else if (mimeType === 'application/pdf') {
        fileType = 'pdf';
      } else {
        // Sadece resim ve PDF kabul et
        continue;
      }

      // Dosya adını oluştur (timestamp + original name)
      const timestamp = Date.now();
      const originalName = file.name;
      const extension = originalName.split('.').pop();
      const filename = `${timestamp}-${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filepath = join(uploadDir, filename);

      // Dosyayı kaydet
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filepath, buffer);

      // Veritabanına kaydet
      const media = await Media.create({
        filename,
        originalName,
        url: `/uploads/${filename}`,
        type: fileType,
        mimeType,
        size: file.size,
        uploadedBy: user.email,
      });

      uploadedFiles.push(media);
    }

    return NextResponse.json({ success: true, files: uploadedFiles }, { status: 201 });
  } catch (error: any) {
    console.error('Upload media error:', error);
    return NextResponse.json(
      { error: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
