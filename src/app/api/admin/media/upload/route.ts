import { NextResponse } from "next/server";
import wpPrisma from "@/lib/wpPrisma";
import { requireAdmin } from "@/lib/session";
import path from "path";
import fs from "fs/promises";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

function uploadBaseUrl() {
  const site = (process.env.WP_SITE_URL || "").replace(/\/$/, "");
  return `${site}/wp-content/uploads`;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9\s-_]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(req: Request) {
  requireAdmin();

  const p = process.env.WP_TABLE_PREFIX ?? "wp_";
  const wpRoot = process.env.WP_ROOT_PATH;
  const siteUrl = process.env.WP_SITE_URL;

  if (!wpRoot) return bad("WP_ROOT_PATH missing in .env");
  if (!siteUrl) return bad("WP_SITE_URL missing in .env");

  const form = await req.formData();
  const file = form.get("file") as File | null;

  const title = String(form.get("title") || "").trim();
  const alt = String(form.get("alt") || "").trim();
  const caption = String(form.get("caption") || "").trim();

  if (!file) return bad("file is required");
  if (!file.type.startsWith("image/")) return bad("Only image upload supported");

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, "0");

  const uploadsDir = path.join(wpRoot, "wp-content", "uploads", yyyy, mm);
  await fs.mkdir(uploadsDir, { recursive: true });

  const originalName = file.name || "image";
  const ext = path.extname(originalName) || ".jpg";
  const base = slugify(originalName) || "image";
  const finalName = `${base}-${Date.now()}${ext}`;

  const absFilePath = path.join(uploadsDir, finalName);
  await fs.writeFile(absFilePath, buffer);

  const relative = `${yyyy}/${mm}/${finalName}`;
  const publicUrl = `${uploadBaseUrl()}/${relative}`;

  // Attachment row
  await wpPrisma.$executeRawUnsafe(
    `
    INSERT INTO ${p}posts
    (post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt,
     post_status, comment_status, ping_status, post_name, post_modified, post_modified_gmt,
     post_parent, guid, post_type, post_mime_type)
    VALUES
    (1, NOW(), UTC_TIMESTAMP(), '', ?, ?, 'inherit', 'closed', 'closed', ?, NOW(), UTC_TIMESTAMP(),
     0, ?, 'attachment', ?)
    `,
    title || base,
    caption || "",
    base,
    publicUrl,      // guid (ok, but we still rely on _wp_attached_file)
    file.type
  );

  const idRow = await wpPrisma.$queryRawUnsafe<any[]>(`SELECT LAST_INSERT_ID() as id`);
  const attachmentId = Number(idRow?.[0]?.id || 0);
  if (!attachmentId) return bad("Failed to create attachment", 500);

  // Required WP meta
  await wpPrisma.$executeRawUnsafe(
    `INSERT INTO ${p}postmeta (post_id, meta_key, meta_value) VALUES (?, '_wp_attached_file', ?)`,
    attachmentId,
    relative
  );

  if (alt) {
    await wpPrisma.$executeRawUnsafe(
      `INSERT INTO ${p}postmeta (post_id, meta_key, meta_value) VALUES (?, '_wp_attachment_image_alt', ?)`,
      attachmentId,
      alt
    );
  }

  return NextResponse.json({
    ok: true,
    media: {
      id: attachmentId,
      title: title || base,
      url: publicUrl,     // ✅ always correct now
      alt,
      caption,
      mime: file.type,
      date: now.toISOString(),
    },
  });
}
