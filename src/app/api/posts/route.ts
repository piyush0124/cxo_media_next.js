import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonSafe } from "@/lib/json";
import { getSession } from "@/lib/session";

function bad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, message: msg }, { status });
}

export async function GET(req: Request) {
  const session = getSession();
  if (!session) return bad("Unauthorized", 401);

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const take = Math.min(50, Math.max(5, parseInt(url.searchParams.get("take") || "20", 10)));

  const s = (url.searchParams.get("s") || "").trim();
  const status = (url.searchParams.get("status") || "ALL").toUpperCase(); // ALL|DRAFT|PUBLISHED|TRASH
  const categoryId = url.searchParams.get("categoryId");
  const authorId = url.searchParams.get("authorId");

  const where: any = {
    ...(s
      ? {
          OR: [
            { title: { contains: s } },
            { slug: { contains: s } },
            { excerpt: { contains: s } },
          ],
        }
      : {}),
    ...(status !== "ALL" ? { status } : {}),
    ...(categoryId ? { categoryId: Number(categoryId) } : {}),
    ...(authorId ? { authorId: Number(authorId) } : {}),
  };

  const [total, posts] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * take,
      take,
      include: {
        category: true,
        author: { select: { id: true, username: true, name: true } },
      },
    }),
  ]);

  return NextResponse.json(
    jsonSafe({
      ok: true,
      page,
      take,
      total,
      pages: Math.ceil(total / take),
      posts,
    })
  );
}

export async function POST(req: Request) {
  const session = getSession();
  if (!session) return bad("Unauthorized", 401);

  const body = await req.json().catch(() => ({}));
  const title = String(body.title || "").trim();
  const slug = String(body.slug || "").trim();
  const content = String(body.content || "").trim();
  const excerpt = body.excerpt ? String(body.excerpt) : null;

  const categoryId = Number(body.categoryId);
  const status = (String(body.status || "DRAFT").toUpperCase() || "DRAFT") as any;

  const thumbnail = body.thumbnail ? String(body.thumbnail) : null;
  const featured = Boolean(body.featured);
  const trending = Boolean(body.trending);
  const tags = body.tags ? String(body.tags) : null;

  const publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;

  if (!title) return bad("Title is required");
  if (!slug) return bad("Slug is required");
  if (!content) return bad("Content is required");
  if (!categoryId || Number.isNaN(categoryId)) return bad("categoryId is required");

  const post = await prisma.post.create({
    data: {
      title,
      slug,
      content,
      excerpt,
      thumbnail,
      featured,
      trending,
      tags,
      status,
      categoryId,
      authorId: session.id,
      publishedAt: status === "PUBLISHED" ? publishedAt || new Date() : null,
    },
  });

  return NextResponse.json(jsonSafe({ ok: true, post }));
}
