import HomeHero from "@/components/sections/HomeHero";
import CategoryCarouselSectionBootstrap from "@/components/sections/CategoryCarouselSectionBootstrap";
import MainMenu from "@/components/nav/MainMenu"; // ✅ ADDED

export default async function HomePage() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/home`, { cache: "no-store" });
  const data = res.ok
    ? await res.json()
    : { heroSlides: [], movements: [], sections: [] };

  return (
    <main>
      <div className="container pb-5">
        {/* Utility bar like CXO Media */}
        <div className="d-flex align-items-center justify-content-between gap-2 mt-2">
          <a
            href="#"
            className="px-3 py-2 rounded-pill"
            style={{
              background: "rgba(59,130,246,0.10)",
              color: "#1d4ed8",
              fontWeight: 700,
              fontSize: 12,
              textDecoration: "none",
            }}
          >
            Latest Government Sector Updates
          </a>

          <a
            href="#"
            className="px-3 py-2 rounded-pill border"
            style={{
              fontWeight: 700,
              fontSize: 12,
              textDecoration: "none",
              color: "#0f172a",
              background: "#fff",
            }}
          >
            Visit Company Profile
          </a>
        </div>
        <header className="mt-3 mb-2">
          <MainMenu />
        </header>
        {/* HERO + RIGHT LIST */}
        <HomeHero
          heroSlides={data.heroSlides || []}
          movements={data.movements || []}
        />

        {/* ALL CATEGORY SECTIONS AS CAROUSELS */}
        {(data.sections || []).map((sec: any) => (
          <CategoryCarouselSectionBootstrap
            key={sec.slug}
            title={sec.title}
            slug={sec.slug}
            posts={sec.posts || []}
          />
        ))}
      </div>
    </main>
  );
}
