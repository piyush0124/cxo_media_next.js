import { NextResponse } from "next/server";
import wpPrisma from "@/lib/wpPrisma";

export async function GET() {
  try {
    const p = process.env.WP_TABLE_PREFIX ?? "wp_"; // ✅ IMPORTANT

    const categories = await wpPrisma.$queryRawUnsafe<any[]>(`
      SELECT t.name as label, t.slug as value
      FROM ${p}terms t
      INNER JOIN ${p}term_taxonomy tt ON tt.term_id = t.term_id
      WHERE tt.taxonomy='category'
      ORDER BY t.name ASC
    `);

    const pages = await wpPrisma.$queryRawUnsafe<any[]>(`
      SELECT post_title as label, post_name as value
      FROM ${p}posts
      WHERE post_type='page' AND post_status='publish'
      ORDER BY menu_order ASC, post_title ASC
    `);

    return NextResponse.json({ ok: true, categories: categories || [], pages: pages || [] });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message || "Failed to load menu options" },
      { status: 500 }
    );
  }
}
