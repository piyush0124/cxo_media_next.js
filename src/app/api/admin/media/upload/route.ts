import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import prisma from "@/lib/prisma";

export const runtime = "nodejs";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (!ALLOWED.has(file.type)) {
      return NextResponse.json({ error: "Invalid image type" }, { status: 415 });
    }

    // ---------- SAVE FILE ----------
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name).toLowerCase();
    const safeName =
      crypto.randomBytes(6).toString("hex") +
      "-" +
      file.name.replace(/\s+/g, "-").toLowerCase();

    const filePath = path.join(uploadsDir, safeName);
    await fs.writeFile(filePath, buffer);

    // ✅ important: store a usable URL
    const fileUrl = `/uploads/${safeName}`;

    // ---------- SAVE TO DB ----------
    const media = await prisma.media.create({
      data: {
        title: path.basename(file.name, ext),
        url: fileUrl,
        mimeType: file.type,
        altText: "",
        caption: "",
      },
    });

    return NextResponse.json({ ok: true, media });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Upload failed" }, { status: 500 });
  }
}
