import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export const runtime = "nodejs";

const MAX_MB = 10;
const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function safeFileName(original: string) {
  // keep extension, strip unsafe chars
  const ext = path.extname(original).toLowerCase().slice(0, 10);
  const base = path
    .basename(original, ext)
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 60);

  const id = crypto.randomBytes(8).toString("hex");
  return `${Date.now()}-${id}-${base}${ext}`;
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "no file" }, { status: 400 });
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: "invalid file type" }, { status: 415 });
    }

    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > MAX_MB) {
      return NextResponse.json({ error: `file too large (max ${MAX_MB}MB)` }, { status: 413 });
    }

    const uploadRoot = process.env.UPLOAD_ROOT; 
    // Example: /home/CPANEL_USERNAME/uploads  (create this folder)
    if (!uploadRoot) {
      return NextResponse.json({ error: "UPLOAD_ROOT missing in .env" }, { status: 500 });
    }

    const now = new Date();
    const year = String(now.getFullYear());
    const month = String(now.getMonth() + 1).padStart(2, "0");

    const dir = path.join(uploadRoot, year, month);
    await fs.mkdir(dir, { recursive: true });

    const filename = safeFileName(file.name);
    const filepath = path.join(dir, filename);

    const bytes = await file.arrayBuffer();
    await fs.writeFile(filepath, Buffer.from(bytes));

    // Serve through Next route below
    const url = `/uploads/${year}/${month}/${filename}`;

    return NextResponse.json({ ok: true, url });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "upload failed" }, { status: 500 });
  }
}
