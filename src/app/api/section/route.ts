import { jsonSafe } from "@/lib/json";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = (searchParams.get("slug") || "").trim();
  const take = Math.min(20, Math.max(4, Number(searchParams.get("take") || "12")));

  if (!slug) return NextResponse.json({ posts: [] });

  const posts = await prisma.$queryRaw<any[]>`
    SELECT
      p.ID as id,
      p.post_title as title,
      NULLIF(p.post_excerpt,'') as excerpt,
      p.post_date as date,
      p.post_name as slug,
      img.guid as image
    FROM wpne_posts p
    INNER JOIN wpne_term_relationships tr ON tr.object_id = p.ID
    INNER JOIN wpne_term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
    INNER JOIN wpne_terms t ON t.term_id = tt.term_id

    LEFT JOIN wpne_postmeta pm
      ON pm.post_id = p.ID AND pm.meta_key = '_thumbnail_id'
    LEFT JOIN wpne_posts img
      ON img.ID = CAST(pm.meta_value AS UNSIGNED)

    WHERE
      p.post_type='post'
      AND p.post_status='publish'
      AND tt.taxonomy='category'
      AND t.slug = ${slug}

    ORDER BY p.post_date DESC
    LIMIT ${take}
  `;

 return NextResponse.json(jsonSafe({ posts }));
}
