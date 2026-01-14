import Link from "next/link";
import { formatDateStable } from "@/lib/date";
import { buildwpnePermalink } from "@/lib/permalink";

/** Remove WP block comments + HTML tags + normalize whitespace */
function stripHtml(html = "") {
  return String(html)
    .replace(/<!--[\s\S]*?-->/g, " ") // ✅ Gutenberg comments
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/\[[^\]]*]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// We clamp visually to 3 lines in CSS; keep a sane max to avoid huge DOM text.
function makeExcerpt(content = "", max = 240) {
  const text = stripHtml(content);
  if (!text) return "";
  if (text.length <= max) return text;
  return text.slice(0, max).replace(/\s+\S*$/, "") + "…";
}

export default function StoryCard({ post }: { post: any }) {
  const href = buildwpnePermalink(post?.publishedAt || post?.date, post?.slug);

  const image = post?.image || "/placeholder.jpg";
  const title = post?.title || "";

  // ✅ Works with any API shape: content OR post_content OR excerpt
  const rawContent = post?.content || post?.post_content || post?.excerpt || "";
  const excerpt = makeExcerpt(rawContent);

  return (
    <article className="story-card">
      <Link href={href} aria-label={title || "Read story"}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={title || "Story image"}
          className="story-card__img"
          loading="lazy"
          decoding="async"
        />
      </Link>

      <div className="story-card__body">
        <h3 className="story-card__title">
          <Link href={href} className="story-card__titleLink">
            {title}
          </Link>
        </h3>

        <div className="story-card__meta">
          📅 {formatDateStable(post?.publishedAt || post?.date)}
        </div>

        {/* ✅ This uses the existing CSS clamp to show 3 lines */}
        {excerpt ? (
          <p className={`story-card__desc ${excerpt.length > 160 ? "has-fade" : ""}`}>
            {excerpt}
          </p>
        ) : null}
      </div>
    </article>
  );
}
