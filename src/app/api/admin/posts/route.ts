import { NextResponse, type NextRequest } from "next/server";
import wpPrisma from "@/lib/wpPrisma";
import { requireAdmin } from "@/lib/session";
import { jsonSafe } from "@/lib/json";

export const dynamic = "force-dynamic";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

const UI = {
  publish: "PUBLISHED",
  future: "SCHEDULED",
  draft: "DRAFT",
  private: "PRIVATE",
  trash: "TRASH",
} as const;

function uiStatus(wp: any) {
  const s = wp ? String(wp) : "";
  return (UI as any)[s] ?? s.toUpperCase();
}

function toNum(v: any) {
  if (typeof v === "bigint") return Number(v);
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function GET(req: NextRequest) {
  // ✅ avoid crashing → return 401 JSON
  try {
    requireAdmin();
  } catch {
    return bad("Unauthorized", 401);
  }

  const p = process.env.wp_TABLE_PREFIX ?? "wp_";
  const url = new URL(req.url);

  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const take = Math.min(100, Math.max(1, Number(url.searchParams.get("take") || "20")));
  const skip = (page - 1) * take;

  const s = (url.searchParams.get("s") || "").trim();
  const categoryId = url.searchParams.get("categoryId") || "";
  const month = url.searchParams.get("month") || "";
  const status = (url.searchParams.get("status") || "").toUpperCase();
  const sort = url.searchParams.get("sort") || "date";

  // UI -> WP post_status
  const statusMap: Record<string, string> = {
    PUBLISHED: "publish",
    SCHEDULED: "future",
    DRAFT: "draft",
    PRIVATE: "private",
    TRASH: "trash",
  };
  const wpStatus = status ? statusMap[status] : null;

  // ✅ WP-like: default list excludes trash unless status=TRASH
  const where: string[] = [`p.post_type='post'`];
  const params: any[] = [];

  if (wpStatus) {
    where.push(`p.post_status=?`);
    params.push(wpStatus);
  } else {
    // ✅ IMPORTANT: NO trash here
    where.push(`p.post_status IN ('publish','future','draft','private')`);
  }

  if (s) {
    where.push(`(p.post_title LIKE ? OR p.post_name LIKE ?)`);
    params.push(`%${s}%`, `%${s}%`);
  }

  if (month) {
    where.push(`DATE_FORMAT(p.post_date,'%Y-%m')=?`);
    params.push(month);
  }

  // Optional category filter
  let joinFilter = "";
  if (categoryId) {
    joinFilter = `
      INNER JOIN ${p}term_relationships trf ON trf.object_id = p.ID
      INNER JOIN ${p}term_taxonomy ttf
        ON ttf.term_taxonomy_id = trf.term_taxonomy_id
       AND ttf.taxonomy='category'
    `;
    where.push(`ttf.term_id=?`);
    params.push(Number(categoryId));
  }

  const whereSql = `WHERE ${where.join(" AND ")}`;

  // Sorting (use aliases allowed by MySQL)
  let orderBy = `p.post_date DESC`;
  if (sort === "date_asc") orderBy = `p.post_date ASC`;
  if (sort === "title") orderBy = `p.post_title ASC`;
  if (sort === "title_desc") orderBy = `p.post_title DESC`;
  if (sort === "author") orderBy = `authorName ASC`;
  if (sort === "author_desc") orderBy = `authorName DESC`;
  if (sort === "category") orderBy = `categoryName ASC`;
  if (sort === "category_desc") orderBy = `categoryName DESC`;

  // ✅ Posts + Tags + Featured Media ID
  // - Tags: GROUP_CONCAT from post_tag taxonomy
  // - Category: MAX() to avoid group-by issues
  // - featuredMediaId: from postmeta _thumbnail_id
  const rows = await wpPrisma.$queryRawUnsafe<any[]>(
    `
    SELECT
      CAST(p.ID AS UNSIGNED) as id,
      p.post_title as title,
      p.post_name as slug,
      p.post_date as createdAt,
      p.post_status as wpStatus,

      p.post_excerpt as excerpt,
      p.post_content as content,

      MAX(u.display_name) as authorName,
      MAX(c.name) as categoryName,

      MAX(pmThumb.meta_value) as featuredMediaId,

      GROUP_CONCAT(DISTINCT t.name ORDER BY t.name SEPARATOR ', ') as tags

    FROM ${p}posts p

    LEFT JOIN ${p}users u
      ON u.ID = p.post_author

    -- Category joins
    LEFT JOIN ${p}term_relationships trCat
      ON trCat.object_id = p.ID
    LEFT JOIN ${p}term_taxonomy ttCat
      ON ttCat.term_taxonomy_id = trCat.term_taxonomy_id AND ttCat.taxonomy='category'
    LEFT JOIN ${p}terms c
      ON c.term_id = ttCat.term_id

    -- Tag joins
    LEFT JOIN ${p}term_relationships trTag
      ON trTag.object_id = p.ID
    LEFT JOIN ${p}term_taxonomy ttTag
      ON ttTag.term_taxonomy_id = trTag.term_taxonomy_id AND ttTag.taxonomy='post_tag'
    LEFT JOIN ${p}terms t
      ON t.term_id = ttTag.term_id

    -- Featured media id
    LEFT JOIN ${p}postmeta pmThumb
      ON pmThumb.post_id = p.ID AND pmThumb.meta_key = '_thumbnail_id'

    ${joinFilter}
    ${whereSql}

    GROUP BY p.ID
    ORDER BY ${orderBy}
    LIMIT ${take} OFFSET ${skip}
    `,
    ...params
  );

  // ✅ Total
  const totalRows = await wpPrisma.$queryRawUnsafe<any[]>(
    `
    SELECT CAST(COUNT(DISTINCT p.ID) AS UNSIGNED) as n
    FROM ${p}posts p
    ${joinFilter}
    ${whereSql}
    `,
    ...params
  );

  const total = toNum(totalRows?.[0]?.n ?? 0);
  const pages = Math.max(1, Math.ceil(total / take));

  // ✅ Counts (WP-like: “All” excludes trash)
  const cCounts = await wpPrisma.$queryRawUnsafe<any[]>(
    `
    SELECT
      CAST(SUM(post_status IN ('publish','future','draft','private')) AS UNSIGNED) as allCount,
      CAST(SUM(post_status='publish') AS UNSIGNED) as publishedCount,
      CAST(SUM(post_status='future') AS UNSIGNED) as scheduledCount,
      CAST(SUM(post_status='draft') AS UNSIGNED) as draftsCount,
      CAST(SUM(post_status='private') AS UNSIGNED) as privateCount,
      CAST(SUM(post_status='trash') AS UNSIGNED) as trashCount
    FROM ${p}posts
    WHERE post_type='post'
    `
  );

  const counts = {
    all: toNum(cCounts?.[0]?.allCount ?? 0),
    mine: 0,
    published: toNum(cCounts?.[0]?.publishedCount ?? 0),
    scheduled: toNum(cCounts?.[0]?.scheduledCount ?? 0),
    drafts: toNum(cCounts?.[0]?.draftsCount ?? 0),
    private: toNum(cCounts?.[0]?.privateCount ?? 0),
    trash: toNum(cCounts?.[0]?.trashCount ?? 0),
  };

  // Months dropdown
  const monthsRaw = await wpPrisma.$queryRawUnsafe<{ ym: string }[]>(
    `
    SELECT DISTINCT DATE_FORMAT(post_date, '%Y-%m') as ym
    FROM ${p}posts
    WHERE post_type='post' AND post_status IN ('publish','future','draft','private','trash')
    ORDER BY ym DESC
    LIMIT 36
    `
  );

  const months = (monthsRaw || []).map((r) => {
    const [y, m] = r.ym.split("-");
    const dt = new Date(Number(y), Number(m) - 1, 1);
    return {
      value: r.ym,
      label: dt.toLocaleString("en-IN", { month: "long", year: "numeric" }),
    };
  });

  // Response shape used by AdminPostsPage
  const posts = (rows || []).map((r) => ({
    id: toNum(r.id),
    title: r.title || "",
    slug: r.slug || "",
    status: uiStatus(r.wpStatus),

    createdAt: r.createdAt,
    excerpt: r.excerpt || "",
    content: r.content || "",

    tags: r.tags || "",
    featuredMediaId: r.featuredMediaId ? toNum(r.featuredMediaId) : null,

    views: 0,
    author: { username: r.authorName || "-" },
    category: { name: r.categoryName || "-" },
  }));

  return NextResponse.json(jsonSafe({ posts, total, pages, counts, months }));
}
