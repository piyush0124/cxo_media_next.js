import { NextResponse } from "next/server";
import wpPrisma from "@/lib/wpPrisma";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

function uploadBaseUrl() {
  const site = (process.env.WP_SITE_URL || "").replace(/\/$/, "");
  return `${site}/wp-content/uploads`;
}

export async function GET(req: Request) {
  requireAdmin();

  const p = process.env.WP_TABLE_PREFIX ?? "wp_";
  const url = new URL(req.url);

  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const take = Math.min(60, Math.max(1, Number(url.searchParams.get("take") || "30")));
  const skip = (page - 1) * take;
  const s = (url.searchParams.get("s") || "").trim();

  const where: string[] = [`a.post_type='attachment'`, `a.post_status='inherit'`];
  const params: any[] = [];
  if (s) {
    where.push(`(a.post_title LIKE ? OR a.guid LIKE ? OR af.meta_value LIKE ?)`);
    params.push(`%${s}%`, `%${s}%`, `%${s}%`);
  }
  const whereSql = `WHERE ${where.join(" AND ")}`;

  // IMPORTANT: do NOT rely on guid for URL. Use _wp_attached_file.
  const rows = await wpPrisma.$queryRawUnsafe<any[]>(
    `
    SELECT
      a.ID as id,
      a.post_title as title,
      a.post_mime_type as mime,
      a.post_date as date,
      af.meta_value as filePath,
      alt.meta_value as alt,
      a.post_excerpt as caption
    FROM ${p}posts a
    LEFT JOIN ${p}postmeta af
      ON af.post_id = a.ID AND af.meta_key = '_wp_attached_file'
    LEFT JOIN ${p}postmeta alt
      ON alt.post_id = a.ID AND alt.meta_key = '_wp_attachment_image_alt'
    ${whereSql}
    ORDER BY a.ID DESC
    LIMIT ${take} OFFSET ${skip}
    `,
    ...params
  );

  const totalRows = await wpPrisma.$queryRawUnsafe<any[]>(
    `
    SELECT COUNT(*) as n
    FROM ${p}posts a
    LEFT JOIN ${p}postmeta af
      ON af.post_id = a.ID AND af.meta_key = '_wp_attached_file'
    ${whereSql}
    `,
    ...params
  );

  const base = uploadBaseUrl();
  const media = rows.map((r) => ({
    id: Number(r.id),
    title: r.title || "",
    mime: r.mime || "",
    date: r.date,
    alt: r.alt || "",
    caption: r.caption || "",
    // Build URL from uploads path
    url: r.filePath ? `${base}/${String(r.filePath).replace(/^\/+/, "")}` : (r.guid || ""),
    filePath: r.filePath || "",
  }));

  const total = Number(totalRows?.[0]?.n || 0);
  const pages = Math.max(1, Math.ceil(total / take));

  return NextResponse.json({ media, total, pages });
}
