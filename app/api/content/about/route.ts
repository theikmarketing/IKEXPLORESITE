import { NextResponse } from 'next/server';
import { getAboutContent, saveAboutContent, AboutContent } from '@/lib/content';
import { revalidatePath } from 'next/cache';

export async function GET() {
  const content = await getAboutContent();
  return NextResponse.json(content || null);
}

export async function PUT(request: Request) {
  try {
    const body = await request.json() as AboutContent;
    if (!body.heroTitle || !body.heroSubtitle) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const saved = await saveAboutContent({
      heroTitle: body.heroTitle,
      heroSubtitle: body.heroSubtitle,
      story: body.story || '',
      mission: body.mission || '',
      reasons: Array.isArray(body.reasons) ? body.reasons : [],
    });
    revalidatePath('/about');
    return NextResponse.json(saved, { status: 200 });
  } catch (error) {
    console.error('Error saving about content:', error);
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
  }
}
