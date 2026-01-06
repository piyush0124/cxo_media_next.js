import HomeHero from "@/components/sections/HomeHero";
import CategoryCarouselSectionBootstrap from "@/components/sections/CategoryCarouselSectionBootstrap";

export default async function HomePage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/home`, { cache: "no-store" });
  const data = res.ok ? await res.json() : { hero: null, movements: [], sections: [] };

  return (
    <main className="max-w-6xl mx-auto px-4 pb-16">
      {/* Utility bar like CXO Media */}
      <div className="flex items-center justify-between text-xs mt-3">
        <a className="px-3 py-1 rounded bg-blue-50 text-blue-800">
          Latest Government Sector Updates
        </a>
        <a className="px-3 py-1 rounded border">
          Visit Company Profile
        </a>
      </div>

      {/* HERO + RIGHT LIST */}
<HomeHero heroSlides={data.heroSlides || []} movements={data.movements || []} />


      {/* ALL CATEGORY SECTIONS AS CAROUSELS */}
      {(data.sections || []).map((sec: any) => (
  <CategoryCarouselSectionBootstrap
    key={sec.slug}
    title={sec.title}
    posts={sec.posts || []}
  />
))}

    </main>
  );
}
