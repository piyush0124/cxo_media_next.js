import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import wpdb from "@/lib/wpdb";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type UnifiedMedia = {
  id: string; // "prisma:12" or "wp:345"
  source: "prisma" | "wp";
  title: string;
  url: string;
  mime: string;
  createdAt: string;
};

function toISO(d: any) {
  try {
    return new Date(d).toISOString();
  } catch {
    return new Date().toISOString();
  }
}

function getWpTables() {
  const prefix = process.env.WP_TABLE_PREFIX || "wp_";
  if (!/^[A-Za-z0-9_]+$/.test(prefix)) throw new Error("Invalid WP_TABLE_PREFIX");
  return {
    posts: `${prefix}posts`,
    postmeta: `${prefix}postmeta`,
  };
}

function buildWpUrl(attachedFile: string | null, guid: string | null) {
  const site = (process.env.WP_SITE_URL || "").replace(/\/+$/, "");

  // Best source: _wp_attached_file (ex: "2026/02/image.jpg" or "sites/2/2026/02/image.jpg")
  if (attachedFile && site) {
    return `${site}/wp-content/uploads/${attachedFile.replace(/^\/+/, "")}`;
  }

  // guid can be absolute
  if (guid && /^https?:\/\//i.test(guid)) return guid;

  // guid can be relative ("/wp-content/uploads/..", "?attachment_id=..", etc.)
  if (guid && site) {
    try {
      return new URL(guid, site).toString();
    } catch {
      // ignore
    }
  }

  return "";
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
    const take = Math.min(60, Math.max(1, parseInt(url.searchParams.get("take") || "30", 10)));
    const skip = (page - 1) * take;

    const s = (url.searchParams.get("s") || "").trim();
    const source = (url.searchParams.get("source") || "all") as "all" | "prisma" | "wp";

    // -------- cxo_prisma (Prisma Media) --------
    const prismaWhere =
      s && source !== "wp"
        ? {
            OR: [
              { title: { contains: s } },
              { url: { contains: s } },
              { altText: { contains: s } },
              { caption: { contains: s } },
            ],
          }
        : undefined;

    const prismaPromise =
      source === "wp"
        ? Promise.resolve([] as any[])
        : prisma.media.findMany({
            where: prismaWhere,
            orderBy: { id: "desc" },
            take: 500,
            select: { id: true, title: true, url: true, mimeType: true, createdAt: true },
          });

    // -------- cxo_portal (WordPress attachments) --------
    const { posts, postmeta } = getWpTables();

    // IMPORTANT: Prisma cannot parameterize table names safely, so we validate prefix and then use $queryRawUnsafe.
    // Values (LIKE) are still safely passed as parameters using Prisma.sql in the unsafe string? Not possible.
    // We'll safely interpolate only table names, and keep LIKE value sanitized.
    const like = s ? `%${s.replace(/[%_]/g, "\\$&")}%` : null;

    const wpSql = `
      SELECT 
        p.ID as id,
        p.post_title as title,
        p.guid as guid,
        p.post_mime_type as mime,
        p.post_date_gmt as createdAt,
        pm.meta_value as attachedFile
      FROM \`${posts}\` p
      LEFT JOIN \`${postmeta}\` pm
        ON pm.post_id = p.ID AND pm.meta_key = '_wp_attached_file'
      WHERE p.post_type = 'attachment'
        AND p.post_status = 'inherit'
        ${s ? `AND (p.post_title LIKE ? OR p.guid LIKE ? OR p.post_mime_type LIKE ?)` : ""}
      ORDER BY p.ID DESC
      LIMIT 500
    `;

    const wpPromise =
      source === "prisma"
        ? Promise.resolve([] as any[])
        : (async () => {
            const rows: any[] = s
              ? await wpdb.$queryRawUnsafe(wpSql, like, like, like)
              : await wpdb.$queryRawUnsafe(wpSql);
            return rows || [];
          })();

    const [prismaRows, wpRows] = await Promise.all([prismaPromise, wpPromise]);

    const prismaMedia: UnifiedMedia[] =
      source === "wp"
        ? []
        : prismaRows.map((m: any) => ({
            id: `prisma:${m.id}`,
            source: "prisma",
            title: m.title || "Untitled",
            url: m.url,
            mime: m.mimeType || "",
            createdAt: toISO(m.createdAt),
          }));

    const wpMedia: UnifiedMedia[] =
      source === "prisma"
        ? []
        : wpRows.map((r: any) => ({
            id: `wp:${r.id}`,
            source: "wp",
            title: r.title || "Untitled",
            url: buildWpUrl(r.attachedFile, r.guid),
            mime: r.mime || "",
            createdAt: toISO(r.createdAt || new Date()),
          }));

    const all = [...prismaMedia, ...wpMedia].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const total = all.length;
    const pages = Math.max(1, Math.ceil(total / take));
    const media = all.slice(skip, skip + take);

    return NextResponse.json({ media, total, pages });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load media" }, { status: 500 });
  }
}
