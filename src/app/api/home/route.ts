import { NextResponse } from "next/server";
import wpPrisma from "@/lib/wpPrisma";
import { HOME_SECTIONS } from "@/lib/homeSections";
import { jsonSafe } from "@/lib/json";

export async function GET() {
  const p = process.env.wp_TABLE_PREFIX ?? "wp_";

  // HERO SLIDES: latest 6 published posts + featured image
  const heroSlides = await wpPrisma.$queryRawUnsafe<any[]>(`
    SELECT
      p.ID as id,
      p.post_title as title,
      p.post_date as date,
      p.post_name as slug,
      img.guid as image
    FROM ${p}posts p
    LEFT JOIN ${p}postmeta pm
      ON pm.post_id = p.ID AND pm.meta_key = '_thumbnail_id'
    LEFT JOIN ${p}posts img
      ON img.ID = CAST(pm.meta_value AS UNSIGNED)
    WHERE p.post_type='post' AND p.post_status='publish'
    ORDER BY p.post_date DESC
    LIMIT 6
  `);

  // Movements right-side list (with author + date like screenshot)
  const movements = await wpPrisma.$queryRawUnsafe<any[]>(`
    SELECT
      p.ID as id,
      p.post_title as title,
      p.post_date as date,
      p.post_name as slug,
      u.display_name as author
    FROM ${p}posts p
    LEFT JOIN ${p}users u ON u.ID = p.post_author
    INNER JOIN ${p}term_relationships tr ON tr.object_id = p.ID
    INNER JOIN ${p}term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
    INNER JOIN ${p}terms t ON t.term_id = tt.term_id
    WHERE
      p.post_type='post'
      AND p.post_status='publish'
      AND tt.taxonomy='category'
      AND t.slug='movements'
    ORDER BY p.post_date DESC
    LIMIT 4
  `);

  // All homepage carousel sections with images
  const sections = await Promise.all(
    HOME_SECTIONS.map(async (s) => {
      const posts = await wpPrisma.$queryRawUnsafe<any[]>(
        `
        SELECT
          p.ID as id,
          p.post_title as title,
          -- ✅ Prefer post_excerpt; otherwise fall back to post_content (trimmed)
          COALESCE(NULLIF(p.post_excerpt,''), SUBSTRING(p.post_content, 1, 1200)) as excerpt,
          p.post_date as date,
          p.post_name as slug,
          img.guid as image
        FROM ${p}posts p
        INNER JOIN ${p}term_relationships tr ON tr.object_id = p.ID
        INNER JOIN ${p}term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
        INNER JOIN ${p}terms t ON t.term_id = tt.term_id

        LEFT JOIN ${p}postmeta pm
          ON pm.post_id = p.ID AND pm.meta_key = '_thumbnail_id'
        LEFT JOIN ${p}posts img
          ON img.ID = CAST(pm.meta_value AS UNSIGNED)

        WHERE
          p.post_type='post'
          AND p.post_status='publish'
          AND tt.taxonomy='category'
          AND t.slug = ?
        ORDER BY p.post_date DESC
        LIMIT 14
      `,
        s.slug
      );

      return { ...s, posts };
    })
  );

  return NextResponse.json(jsonSafe({ heroSlides, movements, sections }));
}
