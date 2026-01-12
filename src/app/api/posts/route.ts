import { NextResponse, type NextRequest } from "next/server";
import wpPrisma from "@/lib/wpPrisma";
import { requireAdmin } from "@/lib/session";
import { jsonSafe } from "@/lib/json";

export const dynamic = "force-dynamic"; // ✅ avoid caching

const UI = {
  publish: "PUBLISHED",
  future: "SCHEDULED",
  draft: "DRAFT",
  private: "PRIVATE",
  trash: "TRASH",
} as const;

function uiStatus(wp: string) {
  return (UI as any)[wp] ?? (wp ? String(wp).toUpperCase() : wp);
}

export async function GET(req: NextRequest) {
  requireAdmin();

  const p = process.env.wp_TABLE_PREFIX ?? "wp_";
  const url = new URL(req.url);

  const page = Math.max(1, Number(url.searchParams.get("page") || "1"));
  const take = Math.min(100, Math.max(1, Number(url.searchParams.get("take") || "20")));
  const skip = (page - 1) * take;

  const s = (url.searchParams.get("s") || "").trim();
  const categoryId = url.searchParams.get("categoryId") || "";
  const month = url.searchParams.get("month") || "";
  const status = url.searchParams.get("status") || "";
  const sort = url.searchParams.get("sort") || "date";

  const statusMap: any = {
    PUBLISHED: "publish",
    SCHEDULED: "future",
    DRAFT: "draft",
    PRIVATE: "private",
    TRASH: "trash",
  };
  const wpStatus = status ? statusMap[status] : null;

  const where: string[] = [`p.post_type='post'`];
  const params: any[] = [];

  if (wpStatus) {
    where.push(`p.post_status=?`);
    params.push(wpStatus);
  } else {
    where.push(`p.post_status IN ('publish','future','draft','private','trash')`);
  }

  if (s) {
    where.push(`(p.post_title LIKE ? OR p.post_name LIKE ?)`);
    params.push(`%${s}%`, `%${s}%`);
  }

  if (month) {
    where.push(`DATE_FORMAT(p.post_date,'%Y-%m')=?`);
    params.push(month);
  }

  let joinFilter = "";
  if (categoryId) {
    joinFilter = `
      INNER JOIN ${p}term_relationships trf ON trf.object_id = p.ID
      INNER JOIN ${p}term_taxonomy ttf ON ttf.term_taxonomy_id = trf.term_taxonomy_id AND ttf.taxonomy='category'
    `;
    where.push(`ttf.term_id=?`);
    params.push(Number(categoryId));
  }

  const whereSql = `WHERE ${where.join(" AND ")}`;

  let orderBy = `p.post_date DESC`;
  if (sort === "date_asc") orderBy = `p.post_date ASC`;
  if (sort === "title") orderBy = `p.post_title ASC`;
  if (sort === "title_desc") orderBy = `p.post_title DESC`;
  if (sort === "author") orderBy = `u.display_name ASC`;
  if (sort === "author_desc") orderBy = `u.display_name DESC`;

  const rows = await wpPrisma.$queryRawUnsafe<any[]>(
    `
    SELECT
      p.ID as id,
      p.post_title as title,
      p.post_name as slug,
      p.post_date as createdAt,
      p.post_status as wpStatus,
      u.display_name as authorName,
      c.name as categoryName
    FROM ${p}posts p
    LEFT JOIN ${p}users u ON u.ID = p.post_author
    LEFT JOIN ${p}term_relationships tr ON tr.object_id = p.ID
    LEFT JOIN ${p}term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id AND tt.taxonomy='category'
    LEFT JOIN ${p}terms c ON c.term_id = tt.term_id
    ${joinFilter}
    ${whereSql}
    GROUP BY p.ID
    ORDER BY ${orderBy}
    LIMIT ${take} OFFSET ${skip}
    `,
    ...params
  );

  const totalRows = await wpPrisma.$queryRawUnsafe<{ n: number }[]>(
    `
    SELECT COUNT(DISTINCT p.ID) as n
    FROM ${p}posts p
    ${joinFilter}
    ${whereSql}
    `,
    ...params
  );

  const total = totalRows?.[0]?.n ?? 0;
  const pages = Math.max(1, Math.ceil(total / take));

  const c = await wpPrisma.$queryRawUnsafe<any[]>(`
    SELECT
      SUM(post_status IN ('publish','future','draft','private','trash')) as allCount,
      SUM(post_status='publish') as publishedCount,
      SUM(post_status='future') as scheduledCount,
      SUM(post_status='draft') as draftsCount,
      SUM(post_status='private') as privateCount,
      SUM(post_status='trash') as trashCount
    FROM ${p}posts
    WHERE post_type='post'
  `);

  const counts = {
    all: Number(c?.[0]?.allCount ?? 0),
    mine: 0,
    published: Number(c?.[0]?.publishedCount ?? 0),
    scheduled: Number(c?.[0]?.scheduledCount ?? 0),
    drafts: Number(c?.[0]?.draftsCount ?? 0),
    private: Number(c?.[0]?.privateCount ?? 0),
    trash: Number(c?.[0]?.trashCount ?? 0),
  };

  const monthsRaw = await wpPrisma.$queryRawUnsafe<{ ym: string }[]>(`
    SELECT DISTINCT DATE_FORMAT(post_date, '%Y-%m') as ym
    FROM ${p}posts
    WHERE post_type='post' AND post_status IN ('publish','future','draft','private','trash')
    ORDER BY ym DESC
    LIMIT 36
  `);

  const months = monthsRaw.map((r) => {
    const [y, m] = r.ym.split("-");
    const dt = new Date(Number(y), Number(m) - 1, 1);
    return { value: r.ym, label: dt.toLocaleString("en-IN", { month: "long", year: "numeric" }) };
  });

  const posts = rows.map((r) => ({
    id: r.id,
    title: r.title,
    slug: r.slug,
    tags: "",
    views: 0,
    status: uiStatus(r.wpStatus),
    createdAt: r.createdAt,
    author: { username: r.authorName || "-" },
    category: { name: r.categoryName || "-" },
  }));

  return NextResponse.json(jsonSafe({ posts, total, pages, counts, months }));
}
