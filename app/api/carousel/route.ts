import { NextResponse } from 'next/server';
import { getCarouselImages, saveCarouselImages } from '@/lib/carousel';
import { revalidatePath } from 'next/cache';

export async function GET() {
  const images = await getCarouselImages();
  return NextResponse.json(images);
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }
    const valid = body.every((img) => img && img.url && img.title && img.description);
    if (!valid) {
      return NextResponse.json({ error: 'Missing fields in items' }, { status: 400 });
    }
    const saved = await saveCarouselImages(body);
    revalidatePath('/');
    return NextResponse.json(saved, { status: 200 });
  } catch (error) {
    console.error('Error saving carousel:', error);
    return NextResponse.json({ error: 'Failed to save carousel' }, { status: 500 });
  }
}

