import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonSafe } from "@/lib/json";
import { getSession } from "@/lib/session";

function bad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, message: msg }, { status });
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return bad("Unauthorized", 401);

  const id = Number(params.id);
  if (Number.isNaN(id)) return bad("Invalid id");

  const post = await prisma.post.findUnique({
    where: { id },
    include: { category: true, author: { select: { id: true, username: true, name: true } } },
  });

  if (!post) return bad("Not found", 404);

  return NextResponse.json(jsonSafe({ ok: true, post }));
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return bad("Unauthorized", 401);

  const id = Number(params.id);
  if (Number.isNaN(id)) return bad("Invalid id");

  const body = await req.json().catch(() => ({}));

  const data: any = {};
  for (const key of [
    "title",
    "slug",
    "excerpt",
    "content",
    "thumbnail",
    "featured",
    "trending",
    "tags",
    "status",
    "categoryId",
  ]) {
    if (key in body) data[key] = body[key];
  }

  if ("categoryId" in data) data.categoryId = Number(data.categoryId);

  if ("status" in data) {
    data.status = String(data.status).toUpperCase();
    if (data.status === "PUBLISHED" && !("publishedAt" in data)) {
      data.publishedAt = new Date();
    }
  }

  if ("publishedAt" in body) {
    data.publishedAt = body.publishedAt ? new Date(body.publishedAt) : null;
  }

  const post = await prisma.post.update({ where: { id }, data });
  return NextResponse.json(jsonSafe({ ok: true, post }));
}

// permanent delete (WP: Delete Permanently)
export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session) return bad("Unauthorized", 401);

  const id = Number(params.id);
  if (Number.isNaN(id)) return bad("Invalid id");

  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
