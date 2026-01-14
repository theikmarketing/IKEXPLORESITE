import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITour extends Document {
  id: number;
  title: string;
  description: string;
  price: number;
  duration: string;
  image: string;
  highlights: string[];
  itinerary: string[];
  included: string[];
}

const TourSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: String, required: true },
  image: { type: String, required: true },
  highlights: { type: [String], default: [] },
  itinerary: { type: [String], default: [] },
  included: { type: [String], default: [] },
});

// Prevent overwriting model if it already exists
export const Tour: Model<ITour> = mongoose.models.Tour || mongoose.model<ITour>('Tour', TourSchema);
