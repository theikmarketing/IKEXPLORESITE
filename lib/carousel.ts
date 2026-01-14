import fs from 'fs';
import path from 'path';
import { connectToDatabase } from './db';
import { Carousel as CarouselModel } from '@/models/Carousel';

export interface CarouselImage {
  id: number;
  url: string;
  title: string;
  description: string;
}

const dataFilePath = path.join(process.cwd(), 'data', 'carousel.json');

export async function getCarouselImages(): Promise<CarouselImage[]> {
  const db = await connectToDatabase();
  if (db) {
    const images = await CarouselModel.find({}).sort({ id: 1 }).lean();
    return images.map((i: any) => ({
      ...i,
      id: i.id,
      _id: undefined,
      __v: undefined
    })) as CarouselImage[];
  }

  try {
    if (!fs.existsSync(dataFilePath)) {
      return [];
    }
    const fileContent = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Error reading carousel data:', error);
    return [];
  }
}

export async function saveCarouselImages(images: CarouselImage[]): Promise<CarouselImage[]> {
  const sanitized = images.map((img, idx) => ({
    id: img.id ?? idx + 1,
    url: img.url,
    title: img.title,
    description: img.description,
  }));

  const db = await connectToDatabase();
  if (db) {
    // Replace all carousel images
    await CarouselModel.deleteMany({});
    const saved = await CarouselModel.insertMany(sanitized);
    return saved.map((i: any) => ({
      ...i.toObject(),
      id: i.id,
      _id: undefined,
      __v: undefined
    })) as CarouselImage[];
  }

  fs.writeFileSync(dataFilePath, JSON.stringify(sanitized, null, 2));
  return sanitized;
}

