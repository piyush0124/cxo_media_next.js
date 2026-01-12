import { NextResponse } from "next/server";
import wpPrisma from "@/lib/wpPrisma";
import { requireAdmin } from "@/lib/session";
import { jsonSafe } from "@/lib/json";

export const dynamic = "force-dynamic";

function wpToUiStatus(wp: string) {
  if (wp === "publish") return "PUBLISHED";
  if (wp === "future") return "SCHEDULED";
  if (wp === "draft") return "DRAFT";
  if (wp === "private") return "PRIVATE";
  if (wp === "trash") return "TRASH";
  return String(wp || "").toUpperCase();
}

export async function GET(_req: Request, ctx: { params: { id: string } }) {
  requireAdmin();
  const p = process.env.wp_TABLE_PREFIX ?? "wp_";
  const id = Number(ctx.params.id);
  if (!id) return NextResponse.json({ ok: false, message: "Invalid id" }, { status: 400 });

  const postRows = await wpPrisma.$queryRawUnsafe<any[]>(
    `
    SELECT
      CAST(p.ID AS UNSIGNED) as id,
      p.post_title as title,
      p.post_name as slug,
      p.post_excerpt as excerpt,
      p.post_content as content,
      p.post_status as wpStatus,
      p.post_date as publishedAt
    FROM ${p}posts p
    WHERE p.ID = ${id}
    LIMIT 1
    `
  );

  if (!postRows?.length) return NextResponse.json({ ok: false, message: "Not found" }, { status: 404 });

  // category
  const cat = await wpPrisma.$queryRawUnsafe<any[]>(
    `
    SELECT CAST(t.term_id AS UNSIGNED) as categoryId
    FROM ${p}term_relationships tr
    INNER JOIN ${p}term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
    INNER JOIN ${p}terms t ON t.term_id = tt.term_id
    WHERE tr.object_id = ${id} AND tt.taxonomy='category'
    LIMIT 1
    `
  );

  // tags
  const tagsRows = await wpPrisma.$queryRawUnsafe<any[]>(
    `
    SELECT t.name
    FROM ${p}term_relationships tr
    INNER JOIN ${p}term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
    INNER JOIN ${p}terms t ON t.term_id = tt.term_id
    WHERE tr.object_id = ${id} AND tt.taxonomy='post_tag'
    ORDER BY t.name ASC
    `
  );
  const tags = tagsRows.map((r) => r.name).join(",");

  // featured image
  const thumb = await wpPrisma.$queryRawUnsafe<any[]>(
    `
    SELECT pm.meta_value as featuredMediaId, a.guid as featuredUrl
    FROM ${p}postmeta pm
    LEFT JOIN ${p}posts a ON a.ID = CAST(pm.meta_value AS UNSIGNED)
    WHERE pm.post_id = ${id} AND pm.meta_key='_thumbnail_id'
    LIMIT 1
    `
  );

  const post = postRows[0];

  const initial = {
    id: Number(post.id),
    title: post.title || "",
    slug: post.slug || "",
    excerpt: post.excerpt || "",
    content: post.content || "",
    status: wpToUiStatus(post.wpStatus),
    publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : null,
    categoryId: cat?.[0]?.categoryId ? String(Number(cat[0].categoryId)) : "",
    tags,
    featuredMediaId: thumb?.[0]?.featuredMediaId ? Number(thumb[0].featuredMediaId) : null,
    featuredUrl: thumb?.[0]?.featuredUrl || "",
  };

  return NextResponse.json(jsonSafe({ ok: true, initial }));
}
