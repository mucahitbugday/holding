import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Component from '@/models/Component';
import { getAuthUser } from '@/lib/auth';

// GET - Tek component getir
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const component = await Component.findById(params.id).populate(
      'categoryId',
      'name slug'
    );

    if (!component) {
      return NextResponse.json(
        {
          success: false,
          error: 'Component bulunamadı',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      component,
    });
  } catch (error: any) {
    console.error('Get component error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Component yüklenirken bir hata oluştu',
      },
      { status: 500 }
    );
  }
}

// PUT - Component güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Mevcut component'i kontrol et
    const currentComponent = await Component.findById(params.id);
    if (!currentComponent) {
      return NextResponse.json(
        {
          success: false,
          error: 'Component bulunamadı',
        },
        { status: 404 }
      );
    }

    // Slug kontrolü (sadece slug değiştiyse ve kendisi hariç)
    if (data.slug && data.slug !== currentComponent.slug) {
      const existingComponent = await Component.findOne({
        slug: data.slug,
        _id: { $ne: params.id },
      });
      if (existingComponent) {
        return NextResponse.json(
          {
            success: false,
            error: 'Bu slug zaten kullanılıyor',
          },
          { status: 400 }
        );
      }
    }

    const component = await Component.findByIdAndUpdate(
      params.id,
      data,
      { new: true, runValidators: true }
    ).populate('categoryId', 'name slug');

    if (!component) {
      return NextResponse.json(
        {
          success: false,
          error: 'Component bulunamadı',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      component,
    });
  } catch (error: any) {
    console.error('Update component error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Component güncellenirken bir hata oluştu',
      },
      { status: 500 }
    );
  }
}

// DELETE - Component sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Yetkisiz erişim' },
        { status: 401 }
      );
    }

    await connectDB();

    const component = await Component.findByIdAndDelete(params.id);

    if (!component) {
      return NextResponse.json(
        {
          success: false,
          error: 'Component bulunamadı',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Component başarıyla silindi',
    });
  } catch (error: any) {
    console.error('Delete component error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Component silinirken bir hata oluştu',
      },
      { status: 500 }
    );
  }
}

