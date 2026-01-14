import { NextRequest, NextResponse } from "next/server";
import { Admin } from "@/models/Admin";
import { connectToDatabase } from "@/lib/db";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const password = body?.password;
    // Try DB-based password first
    await connectToDatabase();
    const doc = await Admin.findOne({ key: "admin" }).lean();
    if (doc && password) {
      const derived = await new Promise<Buffer>((resolve, reject) => {
        crypto.pbkdf2(password, doc.salt, doc.iterations, 32, "sha256", (err, key) => {
          if (err) reject(err);
          else resolve(key);
        });
      });
      const match = crypto.timingSafeEqual(Buffer.from(doc.hash, "hex"), derived);
      if (!match) {
        return NextResponse.json({ ok: false }, { status: 401 });
      }
    } else {
      const expected = process.env.ADMIN_PASSWORD || "admin123";
      if (!password || password !== expected) {
        return NextResponse.json({ ok: false }, { status: 401 });
      }
    }
    const res = NextResponse.json({ ok: true });
    res.cookies.set("admin_auth", "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      path: "/",
      maxAge: 60 * 60 * 24,
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
