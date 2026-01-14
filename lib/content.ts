import fs from 'fs';
import path from 'path';
import { connectToDatabase } from './db';
import { Content as ContentModel } from '@/models/Content';

export type AboutContent = {
  heroTitle: string;
  heroSubtitle: string;
  story: string;
  mission: string;
  reasons: string[];
};

export type ContactInfo = {
  email: string;
  phone: string;
  addressLines: string[];
  businessHoursLines: string[];
};

const aboutPath = path.join(process.cwd(), 'data', 'about.json');
const contactPath = path.join(process.cwd(), 'data', 'contact.json');

export async function getAboutContent(): Promise<AboutContent | null> {
  const db = await connectToDatabase();
  if (db) {
    const doc = await ContentModel.findOne({ key: 'about' }).lean();
    return doc ? (doc.data as AboutContent) : null;
  }
  try {
    if (!fs.existsSync(aboutPath)) return null;
    const txt = fs.readFileSync(aboutPath, 'utf-8');
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

export async function saveAboutContent(data: AboutContent): Promise<AboutContent> {
  const db = await connectToDatabase();
  if (db) {
    await ContentModel.updateOne({ key: 'about' }, { key: 'about', data }, { upsert: true });
    return data;
  }
  fs.mkdirSync(path.dirname(aboutPath), { recursive: true });
  fs.writeFileSync(aboutPath, JSON.stringify(data, null, 2));
  return data;
}

export async function getContactInfo(): Promise<ContactInfo | null> {
  const db = await connectToDatabase();
  if (db) {
    const doc = await ContentModel.findOne({ key: 'contact' }).lean();
    return doc ? (doc.data as ContactInfo) : null;
  }
  try {
    if (!fs.existsSync(contactPath)) return null;
    const txt = fs.readFileSync(contactPath, 'utf-8');
    return JSON.parse(txt);
  } catch {
    return null;
  }
}

export async function saveContactInfo(data: ContactInfo): Promise<ContactInfo> {
  const db = await connectToDatabase();
  if (db) {
    await ContentModel.updateOne({ key: 'contact' }, { key: 'contact', data }, { upsert: true });
    return data;
  }
  fs.mkdirSync(path.dirname(contactPath), { recursive: true });
  fs.writeFileSync(contactPath, JSON.stringify(data, null, 2));
  return data;
}
