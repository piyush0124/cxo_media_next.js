import Link from "next/link";
import wpPrisma from "@/lib/wpPrisma";
import StoryCard from "@/components/cards/StoryCard";

function getPageItems(current: number, total: number) {
  // returns array of numbers and "…" for pagination bar
  const delta = 2; // how many pages around current
  const pages: (number | "…")[] = [];

  const left = Math.max(1, current - delta);
  const right = Math.min(total, current + delta);

  if (left > 1) {
    pages.push(1);
    if (left > 2) pages.push("…");
  }

  for (let p = left; p <= right; p++) pages.push(p);

  if (right < total) {
    if (right < total - 1) pages.push("…");
    pages.push(total);
  }

  return pages;
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams?: { page?: string };
}) {
  const p = process.env.wp_TABLE_PREFIX ?? "wp_";
  const slug = (params.slug || "").trim();

  const page = Math.max(1, Number(searchParams?.page || "1"));
  const take = 12;
  const offset = (page - 1) * take;

  // ✅ Get category details
  const catRows = await wpPrisma.$queryRawUnsafe<any[]>(
    `
    SELECT t.term_id as id, t.name as name, t.slug as slug
    FROM ${p}terms t
    INNER JOIN ${p}term_taxonomy tt ON tt.term_id = t.term_id
    WHERE tt.taxonomy='category' AND t.slug = ?
    LIMIT 1
    `,
    slug
  );

  const cat = catRows?.[0];
  if (!cat) return <div className="container py-4">Category not found</div>;

  // ✅ Count total posts for this category (for numbered pagination)
  const countRows = await wpPrisma.$queryRawUnsafe<any[]>(
    `
    SELECT COUNT(DISTINCT p.ID) as total
    FROM ${p}posts p
    INNER JOIN ${p}term_relationships tr ON tr.object_id = p.ID
    INNER JOIN ${p}term_taxonomy tt ON tt.term_taxonomy_id = tr.term_taxonomy_id
    INNER JOIN ${p}terms t ON t.term_id = tt.term_id
    WHERE
      p.post_type='post'
      AND p.post_status='publish'
      AND tt.taxonomy='category'
      AND t.slug = ?
    `,
    slug
  );

  const totalPosts = Number(countRows?.[0]?.total || 0);
  const totalPages = Math.max(1, Math.ceil(totalPosts / take));
  const safePage = Math.min(page, totalPages);

  // if user requested a page > total, shift to last page
  const safeOffset = (safePage - 1) * take;

  // ✅ Fetch current page posts
  const posts = await wpPrisma.$queryRawUnsafe<any[]>(
    `
    SELECT
      p.ID as id,
      p.post_title as title,
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
    LIMIT ${take}
    OFFSET ${safeOffset}
    `,
    slug
  );

  const hasPrev = safePage > 1;
  const hasNext = safePage < totalPages;

  const pageItems = getPageItems(safePage, totalPages);

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-2">
        <h1 className="m-0">{cat.name}</h1>
        <Link href="/" className="text-decoration-none">
          ← Back to Home
        </Link>
      </div>

      <div className="text-muted mb-3">
        Showing page {safePage} of {totalPages} ({totalPosts} posts)
      </div>

      {/* ✅ Cards grid */}
      <div className="row g-3">
        {posts.map((post: any) => (
          <div key={post.id} className="col-12 col-sm-6 col-lg-4">
            <StoryCard post={post} />
          </div>
        ))}
      </div>

      {/* ✅ Numbered pagination */}
      {totalPages > 1 && (
        <div className="d-flex flex-wrap gap-2 align-items-center justify-content-center mt-4">
          <Link
            href={`/category/${slug}?page=${safePage - 1}`}
            className={`btn btn-outline-dark ${hasPrev ? "" : "disabled"}`}
            aria-disabled={!hasPrev}
            tabIndex={!hasPrev ? -1 : 0}
          >
            ← Prev
          </Link>

          {pageItems.map((it, idx) =>
            it === "…" ? (
              <span key={`dots-${idx}`} className="px-2 text-muted">
                …
              </span>
            ) : (
              <Link
                key={it}
                href={`/category/${slug}?page=${it}`}
                className={`btn ${
                  it === safePage ? "btn-dark" : "btn-outline-dark"
                }`}
                aria-current={it === safePage ? "page" : undefined}
              >
                {it}
              </Link>
            )
          )}

          <Link
            href={`/category/${slug}?page=${safePage + 1}`}
            className={`btn btn-outline-dark ${hasNext ? "" : "disabled"}`}
            aria-disabled={!hasNext}
            tabIndex={!hasNext ? -1 : 0}
          >
            Next →
          </Link>
        </div>
      )}
    </div>
  );
}
