import { NextResponse } from 'next/server';
import { getTourById, updateTour, deleteTour } from '@/lib/tours';
import { revalidatePath } from 'next/cache';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id);
  const tour = await getTourById(id);

  if (!tour) {
    return NextResponse.json(
      { error: 'Tour not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(tour);
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const updated = await updateTour(id, body);
    if (!updated) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }
    revalidatePath('/');
    revalidatePath(`/tours/${id}`);
    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error('Error updating tour:', error);
    return NextResponse.json({ error: 'Failed to update tour' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const success = await deleteTour(id);
    if (!success) {
      return NextResponse.json({ error: 'Tour not found' }, { status: 404 });
    }
    revalidatePath('/');
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Error deleting tour:', error);
    return NextResponse.json({ error: 'Failed to delete tour' }, { status: 500 });
  }
}
