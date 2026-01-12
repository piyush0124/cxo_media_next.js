import { NextResponse } from "next/server";
import wpPrisma from "@/lib/wpPrisma";
import { getSession } from "@/lib/session";
import { jsonSafe } from "@/lib/json";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

function toWpStatus(status?: string): "draft" | "publish" | "future" {
  if (status === "PUBLISHED") return "publish";
  if (status === "SCHEDULED") return "future";
  return "draft";
}

export async function POST(req: Request) {
  const session = getSession();
  if (!session) return bad("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  if (!body) return bad("Invalid JSON");

  const {
    id, // WP post ID if editing
    title,
    slug,
    excerpt,
    content,
    categoryId, // WP term_id
    status,
    publishedAt,
    thumbnailId, // attachment ID optional
  } = body;

  if (!title?.trim()) return bad("Title is required");
  if (!slug?.trim()) return bad("Slug is required");
  if (!content?.trim()) return bad("Content is required");
  if (!categoryId) return bad("Category is required");

  const p = process.env.wp_TABLE_PREFIX ?? "wp_";
  const wpStatus = toWpStatus(status);

  let dt = publishedAt ? new Date(publishedAt) : new Date();
  if (Number.isNaN(dt.getTime())) return bad("Invalid publishedAt");
  if (wpStatus === "future" && dt <= new Date()) dt = new Date();

  try {
    const wpPostId = await wpPrisma.$transaction(async (tx) => {
      let postId = id ? Number(id) : 0;

      if (postId) {
        await tx.$queryRawUnsafe(
          `
          UPDATE ${p}posts
          SET post_title=?, post_name=?, post_content=?, post_excerpt=?,
              post_status=?, post_date=?, post_date_gmt=UTC_TIMESTAMP(),
              post_modified=NOW(), post_modified_gmt=UTC_TIMESTAMP()
          WHERE ID=? AND post_type='post'
        `,
          title.trim(),
          slug.trim(),
          content,
          excerpt?.trim() || "",
          wpStatus,
          dt,
          postId
        );
      } else {
        await tx.$queryRawUnsafe(
          `
          INSERT INTO ${p}posts
            (post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt,
             post_status, comment_status, ping_status, post_name, post_type,
             post_modified, post_modified_gmt)
          VALUES
            (?, ?, UTC_TIMESTAMP(), ?, ?, ?, ?, 'open', 'open', ?, 'post', NOW(), UTC_TIMESTAMP())
        `,
          1, // safest WP admin user id
          dt,
          content,
          title.trim(),
          excerpt?.trim() || "",
          wpStatus,
          slug.trim()
        );

        const rows = await tx.$queryRawUnsafe<{ id: number }[]>(`SELECT LAST_INSERT_ID() as id`);
        postId = rows?.[0]?.id ?? 0;
      }

      // category term_id -> term_taxonomy_id
      const tax = await tx.$queryRawUnsafe<{ term_taxonomy_id: number }[]>(
        `
        SELECT term_taxonomy_id
        FROM ${p}term_taxonomy
        WHERE term_id=? AND taxonomy='category'
        LIMIT 1
      `,
        Number(categoryId)
      );
      const termTaxId = tax?.[0]?.term_taxonomy_id;
      if (!termTaxId) throw new Error("Invalid categoryId");

      // replace relationships
      await tx.$queryRawUnsafe(`DELETE FROM ${p}term_relationships WHERE object_id=?`, postId);
      await tx.$queryRawUnsafe(
        `INSERT INTO ${p}term_relationships (object_id, term_taxonomy_id, term_order) VALUES (?, ?, 0)`,
        postId,
        termTaxId
      );

      // thumbnail meta
      if (thumbnailId) {
        await tx.$queryRawUnsafe(
          `DELETE FROM ${p}postmeta WHERE post_id=? AND meta_key='_thumbnail_id'`,
          postId
        );
        await tx.$queryRawUnsafe(
          `INSERT INTO ${p}postmeta (post_id, meta_key, meta_value) VALUES (?, '_thumbnail_id', ?)`,
          postId,
          String(Number(thumbnailId))
        );
      }

      return postId;
    });

    return NextResponse.json(jsonSafe({ ok: true, wpPostId }));
  } catch (e: any) {
    return bad(e?.message || "Save failed", 500);
  }
}
