import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Component from '@/models/Component';

// GET - Slug'a göre component getir (public)
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    await connectDB();

    const component = await Component.findOne({ 
      slug: params.slug,
      isActive: true 
    }).populate('categoryId', 'name slug');

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
    console.error('Get component by slug error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Component yüklenirken bir hata oluştu',
      },
      { status: 500 }
    );
  }
}

