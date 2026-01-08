import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { jsonSafe } from "@/lib/json";

function bad(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export async function POST(req: Request) {
  const session = getSession();
  if (!session) return bad("Unauthorized", 401);

  const body = await req.json().catch(() => null);
  if (!body) return bad("Invalid JSON");

  const {
    id,
    title,
    slug,
    excerpt,
    content,
    thumbnail,
    tags,
    categoryId,
    status,
    publishedAt, // ISO string OR null
  } = body;

  if (!title?.trim()) return bad("Title is required");
  if (!slug?.trim()) return bad("Slug is required");
  if (!content?.trim()) return bad("Content is required");
  if (!categoryId) return bad("Category is required");

  // ✅ Scheduling rules like WordPress
  let finalStatus = status || "DRAFT";
  let finalPublishedAt: Date | null = publishedAt ? new Date(publishedAt) : null;

  if (finalStatus === "SCHEDULED") {
    if (!finalPublishedAt || isNaN(finalPublishedAt.getTime())) {
      return bad("Scheduled posts require a valid publish date/time");
    }
    // If scheduled date is already in past, publish immediately
    if (finalPublishedAt <= new Date()) {
      finalStatus = "PUBLISHED";
    }
  } else {
    // If not scheduled, publishedAt is optional. For published, set now if missing.
    if (finalStatus === "PUBLISHED" && !finalPublishedAt) {
      finalPublishedAt = new Date();
    }
    if (finalStatus !== "PUBLISHED") {
      // keep publishedAt if you want history, or null it:
      // finalPublishedAt = null;
    }
  }

  const data = {
    title: title.trim(),
    slug: slug.trim(),
    excerpt: excerpt?.trim() || null,
    content,
    thumbnail: thumbnail?.trim() || null,
    tags: tags?.trim() || null,
    categoryId: Number(categoryId),
    status: finalStatus,
    publishedAt: finalPublishedAt,
    authorId: session.id,
  };

  try {
    const saved = id
      ? await prisma.post.update({ where: { id: Number(id) }, data })
      : await prisma.post.create({ data });

    return NextResponse.json(jsonSafe({ ok: true, post: saved }));
  } catch (e: any) {
    // slug unique error etc.
    return bad(e?.message || "Save failed", 500);
  }
}
