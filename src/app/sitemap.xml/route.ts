import { NextResponse } from "next/server";
import wpPrisma from "@/lib/wpPrisma";

export async function GET() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const p = process.env.wp_TABLE_PREFIX ?? "wp_";

  const posts = await wpPrisma.$queryRawUnsafe<any[]>(
    `
    SELECT post_name as slug, post_date as date
    FROM ${p}posts
    WHERE post_type='post' AND post_status='publish'
    ORDER BY post_date DESC
    LIMIT 20000
    `
  );

  const urls = posts.map((x) => {
    const d = new Date(x.date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const loc = `${base}/${yyyy}/${mm}/${dd}/${x.slug}/`;
    const lastmod = d.toISOString();
    return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`;
  });

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.join("") +
    `</urlset>`;

  return new NextResponse(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
