export default async function TrendingBar() {
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.VERCEL_URL?.startsWith("http")
      ? process.env.VERCEL_URL
      : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/trending`, { cache: "no-store" });
  const posts = res.ok ? await res.json() : [];

  return (
    <section className="mb-4">
      <h2 className="font-semibold mb-2">Trending</h2>
      <div className="flex gap-3 overflow-x-auto">
        {posts.map((p: any) => (
          <div key={p.id} className="text-sm whitespace-nowrap">
            {p.title}
          </div>
        ))}
      </div>
    </section>
  );
}
