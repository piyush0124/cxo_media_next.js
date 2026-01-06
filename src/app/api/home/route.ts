import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { HOME_SECTIONS } from "@/lib/homeSections";
import { jsonSafe } from "@/lib/json";

export async function GET() {
  // HERO SLIDES: latest 6 published posts + featured image
  const heroSlides = await prisma.$queryRaw<any[]>`
    SELECT
      p.ID as id,
      p.post_title as title,
      p.post_date as date,
      p.post_name as slug,
      img.guid as image
    FROM wpne_posts p
    LEFT JOIN wpne_postmeta pm
      ON pm.post_id = p.ID AND pm.meta_key = '_thumbnail_id'
    LEFT JOIN wpne_posts img
      ON img.ID = CAST(pm.meta_value AS UNSIGNED)
    WHERE p.post_type='post' AND p.post_status='publish'
    ORDER BY p.post_date DESC
    LIMIT 6
  `;

  // Movements right-side list (with author + date like screenshot)
  const movements = await prisma.$queryRaw<any[]>`
    SELECT
      p.ID as id,
      p.post_title as title,
      p.post_date as date,
      p.post_name as slug,
      u.display_name as author
    FROM wpne_posts p
    LEFT JOIN wpne_users u ON u.ID = p.post_author
    INNER JOIN wpne_term_relationships tr ON tr.object_id = p.ID
    INNER JOIN wpne_term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
    INNER JOIN wpne_terms t ON t.term_id = tt.term_id
    WHERE
      p.post_type='post'
      AND p.post_status='publish'
      AND tt.taxonomy='category'
      AND t.slug='movements'
    ORDER BY p.post_date DESC
    LIMIT 4
  `;

  // All homepage carousel sections with images
  const sections = await Promise.all(
    HOME_SECTIONS.map(async (s) => {
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
          AND t.slug = ${s.slug}
        ORDER BY p.post_date DESC
        LIMIT 14
      `;
      return { ...s, posts };
    })
  );

  return NextResponse.json(jsonSafe({ heroSlides, movements, sections }));
}
