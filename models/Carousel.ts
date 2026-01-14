import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICarousel extends Document {
  id: number;
  url: string;
  title: string;
  description: string;
}

const CarouselSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  url: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
});

export const Carousel: Model<ICarousel> = mongoose.models.Carousel || mongoose.model<ICarousel>('Carousel', CarouselSchema);
