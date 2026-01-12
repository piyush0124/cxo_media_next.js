import { NextResponse } from "next/server";
import wpPrisma from "@/lib/wpPrisma";
import { getSession } from "@/lib/session";
import { jsonSafe } from "@/lib/json";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

function mapUiToWpStatus(ui: string) {
  const s = String(ui || "").toUpperCase();
  if (s === "PUBLISHED") return "publish";
  if (s === "SCHEDULED") return "future";
  if (s === "PRIVATE") return "private";
  if (s === "TRASH") return "trash";
  return "draft";
}

function fmt(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

async function getCategoryTaxonomyId(p: string, termId: number) {
  const rows = await wpPrisma.$queryRawUnsafe<any[]>(
    `SELECT CAST(term_taxonomy_id AS UNSIGNED) as id
     FROM ${p}term_taxonomy
     WHERE term_id=? AND taxonomy='category'
     LIMIT 1`,
    termId
  );
  return rows?.[0]?.id ? Number(rows[0].id) : null;
}

async function ensureTagTerm(p: string, name: string) {
  const cleanName = name.trim();
  const slug = cleanName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  const ex = await wpPrisma.$queryRawUnsafe<any[]>(
    `SELECT CAST(term_id AS UNSIGNED) as id
     FROM ${p}terms
     WHERE slug=? OR name=?
     LIMIT 1`,
    slug,
    cleanName
  );

  let termId: number;
  if (ex?.[0]?.id) {
    termId = Number(ex[0].id);
  } else {
    await wpPrisma.$executeRawUnsafe(
      `INSERT INTO ${p}terms (name, slug, term_group) VALUES (?, ?, 0)`,
      cleanName,
      slug
    );
    const created = await wpPrisma.$queryRawUnsafe<any[]>(
      `SELECT CAST(term_id AS UNSIGNED) as id FROM ${p}terms WHERE slug=? LIMIT 1`,
      slug
    );
    termId = Number(created?.[0]?.id);
  }

  const tx = await wpPrisma.$queryRawUnsafe<any[]>(
    `SELECT CAST(term_taxonomy_id AS UNSIGNED) as id
     FROM ${p}term_taxonomy
     WHERE term_id=? AND taxonomy='post_tag'
     LIMIT 1`,
    termId
  );

  let termTaxonomyId: number;
  if (tx?.[0]?.id) {
    termTaxonomyId = Number(tx[0].id);
  } else {
    await wpPrisma.$executeRawUnsafe(
      `INSERT INTO ${p}term_taxonomy (term_id, taxonomy, description, parent, count)
       VALUES (?, 'post_tag', '', 0, 0)`,
      termId
    );
    const createdTx = await wpPrisma.$queryRawUnsafe<any[]>(
      `SELECT CAST(term_taxonomy_id AS UNSIGNED) as id
       FROM ${p}term_taxonomy
       WHERE term_id=? AND taxonomy='post_tag'
       LIMIT 1`,
      termId
    );
    termTaxonomyId = Number(createdTx?.[0]?.id);
  }

  return { termId, termTaxonomyId };
}

async function replaceTermRelationships(p: string, postId: number, termTaxonomyIds: number[]) {
  // Remove old category + tag relationships
  await wpPrisma.$executeRawUnsafe(
    `
    DELETE tr FROM ${p}term_relationships tr
    INNER JOIN ${p}term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
    WHERE tr.object_id = ? AND tt.taxonomy IN ('category','post_tag')
    `,
    postId
  );

  // Add new ones
  for (const ttid of termTaxonomyIds) {
    await wpPrisma.$executeRawUnsafe(
      `INSERT IGNORE INTO ${p}term_relationships (object_id, term_taxonomy_id, term_order)
       VALUES (?, ?, 0)`,
      postId,
      ttid
    );
  }

  // Refresh counts (simple)
  await wpPrisma.$executeRawUnsafe(
    `
    UPDATE ${p}term_taxonomy tt
    SET tt.count = (
      SELECT COUNT(*) FROM ${p}term_relationships tr
      WHERE tr.term_taxonomy_id = tt.term_taxonomy_id
    )
    WHERE tt.taxonomy IN ('category','post_tag')
    `
  );
}

async function upsertPostMeta(p: string, postId: number, key: string, value: string | null) {
  if (value === null || value === "") {
    await wpPrisma.$executeRawUnsafe(
      `DELETE FROM ${p}postmeta WHERE post_id=? AND meta_key=?`,
      postId,
      key
    );
    return;
  }

  const ex = await wpPrisma.$queryRawUnsafe<any[]>(
    `SELECT meta_id FROM ${p}postmeta WHERE post_id=? AND meta_key=? LIMIT 1`,
    postId,
    key
  );

  if (ex?.length) {
    await wpPrisma.$executeRawUnsafe(
      `UPDATE ${p}postmeta SET meta_value=? WHERE post_id=? AND meta_key=?`,
      value,
      postId,
      key
    );
  } else {
    await wpPrisma.$executeRawUnsafe(
      `INSERT INTO ${p}postmeta (post_id, meta_key, meta_value) VALUES (?, ?, ?)`,
      postId,
      key,
      value
    );
  }
}

export async function POST(req: Request) {
  const session = getSession();
  if (!session) return bad("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  if (!body) return bad("Invalid JSON");

  const p = process.env.WP_TABLE_PREFIX ?? "wp_";
  const WP_SITE_URL = (process.env.WP_SITE_URL || "").replace(/\/$/, "");
  if (!WP_SITE_URL) return bad("WP_SITE_URL missing in .env", 500);

  const {
    wpId,
    title,
    slug,
    excerpt,
    content,
    status,
    publishedAt,
    categoryId,
    tags,
    featuredMediaId,
  } = body;

  if (!title?.trim()) return bad("Title is required");
  if (!slug?.trim()) return bad("Slug is required");
  if (!content?.trim()) return bad("Content is required");
  if (!categoryId) return bad("Category is required");

  let wpStatus = mapUiToWpStatus(status);

  // Scheduling rules: if scheduled time is past -> publish
  let postDate = new Date();
  if (wpStatus === "future") {
    const d = publishedAt ? new Date(publishedAt) : null;
    if (!d || isNaN(d.getTime())) return bad("Scheduled posts require valid publish datetime");
    if (d.getTime() <= Date.now()) {
      wpStatus = "publish";
      postDate = new Date();
    } else {
      postDate = d;
    }
  }

  const now = new Date();
  const post_date = fmt(postDate);
  const post_modified = fmt(now);

  let postId = wpId ? Number(wpId) : 0;

  if (!postId) {
    await wpPrisma.$executeRawUnsafe(
      `
      INSERT INTO ${p}posts
        (post_author, post_date, post_date_gmt, post_content, post_title, post_excerpt,
         post_status, comment_status, ping_status, post_name, post_modified, post_modified_gmt,
         post_type, guid)
      VALUES
        (?, ?, UTC_TIMESTAMP(), ?, ?, ?, ?, 'closed', 'closed', ?, ?, UTC_TIMESTAMP(), 'post', '')
      `,
      Number(session.id) || 1,
      post_date,
      content,
      title.trim(),
      (excerpt || "").trim(),
      wpStatus,
      slug.trim(),
      post_modified
    );

    const created = await wpPrisma.$queryRawUnsafe<any[]>(`SELECT CAST(LAST_INSERT_ID() AS UNSIGNED) as id`);
    postId = Number(created?.[0]?.id || 0);

    // set guid as WP style permalink reference
    await wpPrisma.$executeRawUnsafe(
      `UPDATE ${p}posts SET guid=? WHERE ID=?`,
      `${WP_SITE_URL}/?p=${postId}`,
      postId
    );
  } else {
    await wpPrisma.$executeRawUnsafe(
      `
      UPDATE ${p}posts
      SET
        post_title=?,
        post_name=?,
        post_excerpt=?,
        post_content=?,
        post_status=?,
        post_modified=?,
        post_modified_gmt=UTC_TIMESTAMP(),
        post_date=?,
        post_date_gmt=UTC_TIMESTAMP()
      WHERE ID=?
      `,
      title.trim(),
      slug.trim(),
      (excerpt || "").trim(),
      content,
      wpStatus,
      post_modified,
      post_date,
      postId
    );
  }

  // Category
  const catTtid = await getCategoryTaxonomyId(p, Number(categoryId));
  if (!catTtid) return bad("Invalid category (taxonomy id not found)", 400);

  // Tags
  const tagNames = String(tags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const tagTtids: number[] = [];
  for (const name of tagNames) {
    const t = await ensureTagTerm(p, name);
    tagTtids.push(t.termTaxonomyId);
  }

  await replaceTermRelationships(p, postId, [catTtid, ...tagTtids]);

  // Featured image
  await upsertPostMeta(
    p,
    postId,
    "_thumbnail_id",
    featuredMediaId ? String(Number(featuredMediaId)) : null
  );

  return NextResponse.json(jsonSafe({ ok: true, wpId: postId }));
}
