import { NextResponse } from 'next/server';
import { getAllTours, saveTour } from '@/lib/tours';
import { revalidatePath } from 'next/cache';

export async function GET() {
  const tours = await getAllTours();
  return NextResponse.json(tours);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Basic validation
    if (!body.title || !body.description || !body.price || !body.image) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    const newTour = await saveTour(body);
    revalidatePath('/');
    return NextResponse.json(newTour, { status: 201 });
  } catch (error) {
    console.error('Error creating tour:', error);
    return NextResponse.json(
      { error: 'Failed to create tour' },
      { status: 500 }
    );
  }
}
