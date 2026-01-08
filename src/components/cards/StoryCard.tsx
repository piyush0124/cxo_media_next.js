import Link from "next/link";
import { formatDateStable } from "@/lib/date";
import { buildWpPermalink } from "@/lib/permalink";

export default function StoryCard({ post }: { post: any }) {
  const image = post?.image || "/placeholder.jpg";
const href = buildWpPermalink(post?.publishedAt || post?.date, post?.slug);

  return (
    <article className="border bg-white rounded overflow-hidden h-100">
      <Link href={href}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={post?.title}
          style={{ width: "100%", height: 160, objectFit: "cover" }}
        />
      </Link>

      <div className="p-3">
        <h3 className="fw-semibold" style={{ fontSize: 14 }}>
          <Link href={href} className="text-dark text-decoration-none">
            {post?.title}
          </Link>
        </h3>

        <div className="text-muted" style={{ fontSize: 12 }}>
          {formatDateStable(post?.publishedAt || post?.date)}
        </div>
      </div>
    </article>
  );
}
