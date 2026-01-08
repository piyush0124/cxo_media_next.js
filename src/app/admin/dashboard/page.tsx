import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function Dashboard() {
  const [totalPosts, publishedPosts, draftPosts, categories] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "PUBLISHED" } }),
    prisma.post.count({ where: { status: "DRAFT" } }),
    prisma.category.count(),
  ]);

  return (
    <div>
      <h1 className="mb-3">Dashboard</h1>

      <div className="row g-3">
        <div className="col-md-3">
          <div className="bg-white border rounded p-3">
            <div className="text-muted">Total Posts</div>
            <div className="fs-3 fw-bold">{totalPosts}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="bg-white border rounded p-3">
            <div className="text-muted">Published</div>
            <div className="fs-3 fw-bold">{publishedPosts}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="bg-white border rounded p-3">
            <div className="text-muted">Drafts</div>
            <div className="fs-3 fw-bold">{draftPosts}</div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="bg-white border rounded p-3">
            <div className="text-muted">Categories</div>
            <div className="fs-3 fw-bold">{categories}</div>
          </div>
        </div>
      </div>

      <div className="bg-white border rounded p-3 mt-3">
        <div className="d-flex flex-wrap gap-2">
          <Link href="/admin/posts" className="btn btn-dark btn-sm">
            Manage Posts
          </Link>
          <Link href="/admin/posts/new" className="btn btn-outline-dark btn-sm">
            Add New Post
          </Link>
          <Link href="/admin/categories" className="btn btn-outline-dark btn-sm">
            Manage Categories
          </Link>
        </div>
      </div>
    </div>
  );
}
