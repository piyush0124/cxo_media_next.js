import { formatDateStable } from "@/lib/date";

export default function StoryCard({ post }: { post: any }) {
  const image = post?.image || "/placeholder.jpg";

  return (
    <article className="border bg-white rounded overflow-hidden">
      <div style={{ height: 160, background: "#f1f1f1" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={post?.title || "Story"}
          style={{ width: "100%", height: "160px", objectFit: "cover", display: "block" }}
          loading="lazy"
        />
      </div>

      <div className="p-3">
        <h3 className="fw-semibold" style={{ fontSize: 14, lineHeight: 1.3 }}>
          {post?.title}
        </h3>

        {post?.excerpt ? (
          <p className="text-secondary mb-2" style={{ fontSize: 12 }}>
            {post.excerpt}
          </p>
        ) : null}

        {post?.date ? (
          <div className="text-muted" style={{ fontSize: 12 }}>
            {formatDateStable(post.date)}
          </div>
        ) : null}
      </div>
    </article>
  );
}
