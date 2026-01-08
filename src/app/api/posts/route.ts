import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { jsonSafe } from "@/lib/json";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

// Safe sort map (prevents SQL injection by only allowing known fields)
const SORT_MAP: Record<string, any> = {
  title: { title: "asc" },
  title_desc: { title: "desc" },
  author: { author: { username: "asc" } },
  author_desc: { author: { username: "desc" } },
  category: { category: { name: "asc" } },
  category_desc: { category: { name: "desc" } },
  date: { createdAt: "desc" },        // WP default: newest first
  date_asc: { createdAt: "asc" },
  views: { views: "desc" },
  views_asc: { views: "asc" },
};

export async function GET(req: Request) {
  const session = getSession();
  if (!session) return bad("Unauthorized", 401);

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const take = Math.min(100, Math.max(5, parseInt(url.searchParams.get("take") || "20", 10)));

  const s = (url.searchParams.get("s") || "").trim();
  const status = (url.searchParams.get("status") || "ALL").toUpperCase(); // ALL|DRAFT|PUBLISHED|SCHEDULED|PRIVATE|TRASH
  const mine = url.searchParams.get("mine") === "1";
  const categoryId = url.searchParams.get("categoryId");
  const month = url.searchParams.get("month"); // YYYY-MM
  const sort = (url.searchParams.get("sort") || "date").toLowerCase(); // title|author|category|date|views (+ _asc/_desc)

  const where: any = {
    ...(mine ? { authorId: session.id } : {}),
    ...(s
      ? {
          OR: [
            { title: { contains: s } },
            { slug: { contains: s } },
            { excerpt: { contains: s } },
            { content: { contains: s } },
          ],
        }
      : {}),
    ...(status !== "ALL" ? { status } : {}),
    ...(categoryId ? { categoryId: Number(categoryId) } : {}),
  };

  // Month filter YYYY-MM
  if (month && /^\d{4}-\d{2}$/.test(month)) {
    const [y, m] = month.split("-").map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 1);
    where.createdAt = { gte: start, lt: end };
  }

  const orderBy = SORT_MAP[sort] || SORT_MAP["date"];

  // Dynamic months list (like WP All dates dropdown)
  // Gives you list like [{ value: "2026-01", label: "January 2026" }, ...]
  const rawMonths = await prisma.post.findMany({
    select: { createdAt: true },
    orderBy: { createdAt: "desc" },
    take: 2000, // enough to cover lots of months; we then unique it
  });

  const monthSet = new Set<string>();
  for (const r of rawMonths) {
    const d = new Date(r.createdAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthSet.add(key);
  }

  const monthValues = Array.from(monthSet).sort().reverse();
  const months = monthValues.map((val) => {
    const [yy, mm] = val.split("-").map(Number);
    const label = new Date(yy, mm - 1, 1).toLocaleString(undefined, {
      month: "long",
      year: "numeric",
    });
    return { value: val, label };
  });

  const [total, posts, counts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy,
      skip: (page - 1) * take,
      take,
      include: {
        category: true,
        author: { select: { id: true, username: true, name: true } },
      },
    }),
    Promise.all([
      prisma.post.count(), // all
      prisma.post.count({ where: { authorId: session.id } }), // mine
      prisma.post.count({ where: { status: "PUBLISHED" } }),
      prisma.post.count({ where: { status: "SCHEDULED" } }),
      prisma.post.count({ where: { status: "DRAFT" } }),
      prisma.post.count({ where: { status: "PRIVATE" } }),
      prisma.post.count({ where: { status: "TRASH" } }),
    ]).then(([all, mineCount, published, scheduled, drafts, priv, trash]) => ({
      all,
      mine: mineCount,
      published,
      scheduled,
      drafts,
      private: priv,
      trash,
    })),
  ]);

  return NextResponse.json(
    jsonSafe({
      ok: true,
      page,
      take,
      total,
      pages: Math.ceil(total / take),
      posts,
      counts,
      months,
    })
  );
}
