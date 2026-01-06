import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const posts = await prisma.post.findMany({
    where: { trending: true, status: "PUBLISHED" },
    orderBy: { views: "desc" },
    take: 6
  });
  return NextResponse.json(posts);
}
