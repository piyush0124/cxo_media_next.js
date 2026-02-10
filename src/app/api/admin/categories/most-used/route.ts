import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  const cats = await prisma.$queryRaw<
    { id: number; name: string }[]
  >`
    SELECT c.id, c.name
    FROM Category c
    JOIN Post p ON p.categoryId = c.id
    GROUP BY c.id
    ORDER BY COUNT(p.id) DESC
    LIMIT 10
  `;

  return NextResponse.json(cats);
}
