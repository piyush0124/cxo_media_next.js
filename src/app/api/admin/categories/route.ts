import { NextResponse } from "next/server";
import wpPrisma from "@/lib/wpPrisma";
import { requireAdmin } from "@/lib/session";
import { jsonSafe } from "@/lib/json";

export async function GET() {
  requireAdmin();

  const p = process.env.wp_TABLE_PREFIX ?? "wp_";

  const categories = await wpPrisma.$queryRawUnsafe<{ id: number; name: string; slug: string }[]>(`
    SELECT t.term_id AS id, t.name, t.slug
    FROM ${p}terms t
    INNER JOIN ${p}term_taxonomy tt ON tt.term_id = t.term_id
    WHERE tt.taxonomy = 'category'
    ORDER BY t.name ASC
  `);

  return NextResponse.json(jsonSafe({ ok: true, categories }));
}
