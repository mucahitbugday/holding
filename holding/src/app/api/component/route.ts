import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Component from '@/models/Component';
import { getAuthUser } from '@/lib/auth';

// GET - Tüm componentleri getir
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const isActive = searchParams.get('isActive');
    const categoryId = searchParams.get('categoryId');

    const query: any = {};
    if (type) query.type = type;
    if (isActive !== null) query.isActive = isActive === 'true';
    if (categoryId) query.categoryId = categoryId;

    const components = await Component.find(query)
      .sort({ order: 1, createdAt: -1 })
      .populate('categoryId', 'name slug');

    return NextResponse.json({
      success: true,
      components,
    });
  } catch (error: any) {
    console.error('Get components error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Componentler yüklenirken bir hata oluştu',
      },
      { status: 500 }
    );
  }
}

// POST - Yeni component oluştur
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    await connectDB();

    const data = await request.json();

    // Slug kontrolü
    const existingComponent = await Component.findOne({ slug: data.slug });
    if (existingComponent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bu slug zaten kullanılıyor',
        },
        { status: 400 }
      );
    }

    const component = await Component.create(data);

    return NextResponse.json({
      success: true,
      component,
    });
  } catch (error: any) {
    console.error('Create component error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Component oluşturulurken bir hata oluştu',
      },
      { status: 500 }
    );
  }
}

