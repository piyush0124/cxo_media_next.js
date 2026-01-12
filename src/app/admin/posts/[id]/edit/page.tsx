import PostEditor from "@/components/admin/PostEditor";
import wpPrisma from "@/lib/wpPrisma";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function EditPostPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  if (!id) notFound();

  const p = process.env.wp_TABLE_PREFIX ?? "wp_";

  // categories from WP
  const categories = await wpPrisma.$queryRawUnsafe<{ id: number; name: string }[]>(
    `
    SELECT
      CAST(t.term_id AS UNSIGNED) as id,
      t.name as name
    FROM ${p}terms t
    INNER JOIN ${p}term_taxonomy tt ON tt.term_id = t.term_id
    WHERE tt.taxonomy='category'
    ORDER BY t.name ASC
    `
  );

  // post initial data from WP
  const postRows = await wpPrisma.$queryRawUnsafe<any[]>(
    `
    SELECT
      CAST(p.ID AS UNSIGNED) as id,
      p.post_title as title,
      p.post_name as slug,
      p.post_excerpt as excerpt,
      p.post_content as content,
      p.post_status as wpStatus,
      p.post_date as publishedAt
    FROM ${p}posts p
    WHERE p.ID = ${id}
    LIMIT 1
    `
  );

  if (!postRows?.length) notFound();

  const post = postRows[0];

  // first category id
  const catRows = await wpPrisma.$queryRawUnsafe<any[]>(
    `
    SELECT CAST(t.term_id AS UNSIGNED) as categoryId
    FROM ${p}term_relationships tr
    INNER JOIN ${p}term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
    INNER JOIN ${p}terms t ON t.term_id = tt.term_id
    WHERE tr.object_id = ${id} AND tt.taxonomy='category'
    ORDER BY tt.term_taxonomy_id ASC
    LIMIT 1
    `
  );

  const wpToUiStatus = (wp: string) => {
    if (wp === "publish") return "PUBLISHED";
    if (wp === "future") return "SCHEDULED";
    if (wp === "draft") return "DRAFT";
    if (wp === "private") return "PRIVATE";
    if (wp === "trash") return "TRASH";
    return String(wp || "").toUpperCase();
  };

  const initial = {
    id: Number(post.id),
    title: post.title || "",
    slug: post.slug || "",
    excerpt: post.excerpt || "",
    content: post.content || "",
    thumbnail: "",
    tags: "",
    status: wpToUiStatus(post.wpStatus),
    publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : null,
    categoryId: catRows?.[0]?.categoryId ? Number(catRows[0].categoryId) : "",
  };

  return <PostEditor mode="edit" initial={initial} categories={categories} />;
}
