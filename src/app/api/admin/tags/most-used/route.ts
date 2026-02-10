import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  const tags = await prisma.$queryRaw<
    { name: string }[]
  >`
    SELECT t.name
    FROM Tag t
    JOIN _PostTags pt ON pt.B = t.id
    GROUP BY t.id
    ORDER BY COUNT(pt.A) DESC
    LIMIT 20
  `;

  return NextResponse.json(tags);
}
