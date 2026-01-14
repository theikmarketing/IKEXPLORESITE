import { NextRequest, NextResponse } from "next/server";
import { Admin } from "@/models/Admin";
import { connectToDatabase } from "@/lib/db";
import crypto from "crypto";

async function verifyCurrentPassword(input: string): Promise<boolean> {
  await connectToDatabase();
  const doc = await Admin.findOne({ key: "admin" }).lean();
  if (doc) {
    const derived = await new Promise<Buffer>((resolve, reject) => {
      crypto.pbkdf2(input, doc.salt, doc.iterations, 32, "sha256", (err, key) => {
        if (err) reject(err);
        else resolve(key);
      });
    });
    return crypto.timingSafeEqual(Buffer.from(doc.hash, "hex"), derived);
  }
  const expected = process.env.ADMIN_PASSWORD || "admin123";
  return input === expected;
}

async function setNewPassword(newPassword: string) {
  await connectToDatabase();
  const salt = crypto.randomBytes(16).toString("hex");
  const iterations = 100000;
  const derived = await new Promise<Buffer>((resolve, reject) => {
    crypto.pbkdf2(newPassword, salt, iterations, 32, "sha256", (err, key) => {
      if (err) reject(err);
      else resolve(key);
    });
  });
  const hash = derived.toString("hex");
  await Admin.findOneAndUpdate(
    { key: "admin" },
    { hash, salt, iterations, updatedAt: new Date() },
    { upsert: true, new: true }
  );
}

export async function POST(request: NextRequest) {
  try {
    const auth = request.cookies.get("admin_auth")?.value;
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await request.json();
    const current = body?.currentPassword;
    const next = body?.newPassword;
    if (!current || !next || typeof current !== "string" || typeof next !== "string") {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }
    const ok = await verifyCurrentPassword(current);
    if (!ok) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 403 });
    }
    await setNewPassword(next);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}

