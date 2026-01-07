import { prisma } from "@/lib/prisma";
import { formatDateStable } from "@/lib/date";
import { notFound } from "next/navigation";

export default async function StoryPage({
  params,
}: {
  params: { year: string; month: string; day: string; slug: string };
}) {
  const { slug } = params;

  const post = await prisma.$queryRaw<any[]>`
    SELECT
      p.ID as id,
      p.post_title as title,
      p.post_content as content,
      p.post_date as date,
      img.guid as image
    FROM wpne_posts p
    LEFT JOIN wpne_postmeta pm
      ON pm.post_id = p.ID AND pm.meta_key = '_thumbnail_id'
    LEFT JOIN wpne_posts img
      ON img.ID = CAST(pm.meta_value AS UNSIGNED)
    WHERE
      p.post_type = 'post'
      AND p.post_status = 'publish'
      AND p.post_name = ${slug}
    LIMIT 1
  `;

  if (!post?.length) notFound();

  const story = post[0];

  return (
    <article className="container mt-4">
      <h1 className="fw-bold mb-2">{story.title}</h1>

      <div className="text-muted mb-3">
        📅 {formatDateStable(story.date)}
      </div>

      {story.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={story.image}
          alt={story.title}
          className="img-fluid mb-4 rounded"
        />
      ) : null}

      <div
        className="story-content"
        dangerouslySetInnerHTML={{ __html: story.content }}
      />
    </article>
  );
}
