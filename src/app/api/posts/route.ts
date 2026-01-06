import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Number(searchParams.get("page") ?? 1);
  const limit = 10;
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: { author: true, category: true }
    }),
    prisma.post.count({ where: { status: "PUBLISHED" } })
  ]);
  return NextResponse.json({ posts, total, page, pages: Math.ceil(total/limit) });
}

export async function POST(req: Request) {
  const data = await req.json();
  const post = await prisma.post.create({ data });
  return NextResponse.json(post);
}
