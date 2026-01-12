import wpPrisma from "@/lib/prisma";
import Link from "next/link";
import { buildwpnePermalink } from "@/lib/permalink";

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const cat = await wpPrisma.category.findUnique({
    where: { slug: params.slug },
  });

  if (!cat) return <div className="container py-4">Category not found</div>;

  const posts = await wpPrisma.post.findMany({
    where: { categoryId: cat.id, status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="container py-4">
      <h1>{cat.name}</h1>

      {posts.map((p) => (
        <div key={p.id} className="mb-3">
          <Link href={buildwpnePermalink(p.publishedAt, p.slug)}>
            {p.title}
          </Link>
        </div>
      ))}
    </div>
  );
}
