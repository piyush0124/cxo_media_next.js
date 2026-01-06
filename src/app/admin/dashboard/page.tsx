import Link from "next/link";

export default function Dashboard() {
  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <div className="space-x-4">
        <Link className="underline" href="/admin/posts/new">Create Post</Link>
        <Link className="underline" href="/admin/posts">Manage Posts</Link>
      </div>
    </main>
  );
}
