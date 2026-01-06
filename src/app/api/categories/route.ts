import { jsonSafe } from "@/lib/json";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const rows = await prisma.$queryRaw<any[]>`
    SELECT t.name, t.slug
    FROM wpne_terms t
    JOIN wpne_term_taxonomy tt ON tt.term_id = t.term_id
    WHERE tt.taxonomy = 'category'
    ORDER BY t.name ASC
  `;
  return NextResponse.json(jsonSafe(rows));
}
