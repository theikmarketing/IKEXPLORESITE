import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContent extends Document {
  key: string;
  data: any;
}

const ContentSchema: Schema = new Schema({
  key: { type: String, required: true, unique: true },
  data: { type: Schema.Types.Mixed, required: true },
});

export const Content: Model<IContent> = mongoose.models.Content || mongoose.model<IContent>('Content', ContentSchema);
