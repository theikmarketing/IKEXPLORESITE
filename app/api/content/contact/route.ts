import { NextResponse } from 'next/server';
import { getContactInfo, saveContactInfo, ContactInfo } from '@/lib/content';
import { revalidatePath } from 'next/cache';

export async function GET() {
  const info = await getContactInfo();
  return NextResponse.json(info || null);
}

export async function PUT(request: Request) {
  try {
    const body = await request.json() as ContactInfo;
    if (!body.email || !body.phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const saved = await saveContactInfo({
      email: body.email,
      phone: body.phone,
      addressLines: Array.isArray(body.addressLines) ? body.addressLines : [],
      businessHoursLines: Array.isArray(body.businessHoursLines) ? body.businessHoursLines : [],
    });
    revalidatePath('/contact');
    return NextResponse.json(saved, { status: 200 });
  } catch (error) {
    console.error('Error saving contact info:', error);
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 });
  }
}
