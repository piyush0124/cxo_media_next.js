export default async function PostsList() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL?.startsWith("http")
      ? process.env.VERCEL_URL
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

  const res = await fetch(`${baseUrl}/api/posts?page=1`, {
    cache: "no-store",
  });

  const { posts } = res.ok ? await res.json() : { posts: [] };

  return (
    <section className="space-y-3">
      {posts.map((p: any) => (
        <article key={p.id} className="border p-3 rounded">
          <h3 className="font-semibold">{p.title}</h3>
          <p className="text-sm opacity-70">{p.excerpt}</p>
        </article>
      ))}
    </section>
  );
}
