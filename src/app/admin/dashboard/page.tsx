import Link from "next/link";

export default function Dashboard() {
  return (
    <main className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1 className="m-0">Admin Dashboard</h1>

        <form action="/api/auth/logout" method="post">
          <button className="btn btn-outline-dark">Logout</button>
        </form>
      </div>

      <div className="d-flex gap-3">
        <Link className="btn btn-dark" href="/admin/posts/new">
          Create Post
        </Link>
        <Link className="btn btn-outline-dark" href="/admin/posts">
          Manage Posts
        </Link>
      </div>
    </main>
  );
}
