import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdmin extends Document {
  key: string;
  hash: string;
  salt: string;
  iterations: number;
  updatedAt: Date;
}

const AdminSchema: Schema = new Schema({
  key: { type: String, required: true, unique: true, default: 'admin' },
  hash: { type: String, required: true },
  salt: { type: String, required: true },
  iterations: { type: Number, required: true, default: 100000 },
  updatedAt: { type: Date, default: Date.now },
});

export const Admin: Model<IAdmin> = mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);

