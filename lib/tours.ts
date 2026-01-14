import fs from 'fs';
import path from 'path';
import { connectToDatabase } from './db';
import { Tour as TourModel } from '@/models/Tour';

export interface Tour {
  id: number;
  title: string;
  description: string;
  price: number;
  duration: string;
  image: string;
  highlights?: string[];
  itinerary?: string[];
  included?: string[];
}

const dataFilePath = path.join(process.cwd(), 'data', 'tours.json');

export async function getAllTours(): Promise<Tour[]> {
  const db = await connectToDatabase();
  if (db) {
    const tours = await TourModel.find({}).sort({ id: 1 }).lean();
    return tours.map((t: any) => ({
      ...t,
      id: t.id,
      _id: undefined,
      __v: undefined
    })) as Tour[];
  }

  try {
    if (!fs.existsSync(dataFilePath)) {
      return [];
    }
    const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading tours data:', error);
    return [];
  }
}

export async function getTourById(id: number): Promise<Tour | undefined> {
  const db = await connectToDatabase();
  if (db) {
    const tour = await TourModel.findOne({ id }).lean();
    if (!tour) return undefined;
    return { ...tour, _id: undefined, __v: undefined } as unknown as Tour;
  }

  const tours = await getAllTours(); // Now async
  return tours.find(tour => tour.id === id);
}

export async function saveTour(tour: Tour | Omit<Tour, 'id'>): Promise<Tour> {
  const db = await connectToDatabase();
  if (db) {
    if ('id' in tour && tour.id) {
      const updated = await TourModel.findOneAndUpdate(
        { id: tour.id },
        tour,
        { new: true, upsert: true }
      ).lean();
      return { ...updated, _id: undefined, __v: undefined } as unknown as Tour;
    } else {
      // Find max ID
      const lastTour = await TourModel.findOne().sort({ id: -1 });
      const newId = lastTour ? lastTour.id + 1 : 1;
      const newTour = await TourModel.create({ ...tour, id: newId });
      return { ...newTour.toObject(), _id: undefined, __v: undefined } as unknown as Tour;
    }
  }

  const tours = await getAllTours();
  
  if ('id' in tour && tour.id) {
    const index = tours.findIndex(t => t.id === tour.id);
    if (index !== -1) {
      tours[index] = tour as Tour;
      fs.writeFileSync(dataFilePath, JSON.stringify(tours, null, 2));
      return tour as Tour;
    }
  }

  // Add new
  const newId = tours.length > 0 ? Math.max(...tours.map(t => t.id)) + 1 : 1;
  const newTour = { ...tour, id: newId } as Tour;
  tours.push(newTour);
  fs.writeFileSync(dataFilePath, JSON.stringify(tours, null, 2));
  return newTour;
}

export async function updateTour(id: number, updates: Partial<Tour>): Promise<Tour | null> {
  const db = await connectToDatabase();
  if (db) {
    const updated = await TourModel.findOneAndUpdate(
      { id },
      { $set: updates },
      { new: true }
    ).lean();
    if (!updated) return null;
    return { ...updated, _id: undefined, __v: undefined } as unknown as Tour;
  }

  const tours = await getAllTours();
  const index = tours.findIndex(t => t.id === id);
  if (index === -1) return null;
  const updated = { ...tours[index], ...updates, id };
  tours[index] = updated;
  fs.writeFileSync(dataFilePath, JSON.stringify(tours, null, 2));
  return updated;
}

export async function deleteTour(id: number): Promise<boolean> {
  const db = await connectToDatabase();
  if (db) {
    const result = await TourModel.deleteOne({ id });
    return result.deletedCount > 0;
  }

  const tours = await getAllTours();
  const initialLength = tours.length;
  const filteredTours = tours.filter(t => t.id !== id);
  
  if (filteredTours.length === initialLength) {
    return false;
  }
  
  fs.writeFileSync(dataFilePath, JSON.stringify(filteredTours, null, 2));
  return true;
}
