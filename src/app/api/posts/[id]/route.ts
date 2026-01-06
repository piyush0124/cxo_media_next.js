import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return NextResponse.json({ error: "not found" }, { status: 404 });

  const related = await prisma.post.findMany({
    where: {
      id: { not: id },
      status: "PUBLISHED",
      OR: [
        { categoryId: post.categoryId },
        { tags: { contains: post.tags ?? "" } }
      ]
    },
    take: 6
  });

  return NextResponse.json({ post, related });
}
