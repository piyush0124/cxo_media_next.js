"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatDateStable } from "@/lib/date";
import { buildWpPermalink } from "@/lib/permalink";

type HeroItem = {
  id: number | string;
  title: string;
  date?: string;
  publishedAt?: string; // ✅ add this
  slug?: string;
  image?: string | null;
};

type MovementItem = {
  id: number | string;
  title: string;
  date?: string;
  publishedAt?: string; // ✅ add this
  slug?: string;
  author?: string | null;
};

export default function HomeHero({
  heroSlides,
  movements,
}: {
  heroSlides: HeroItem[];
  movements: MovementItem[];
}) {
  const slides = useMemo(() => heroSlides || [], [heroSlides]);
  const [active, setActive] = useState(0);

  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!slides.length) return;
    if (!mounted.current) return;

    const t = window.setInterval(() => {
      setActive((a) => (a + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(t);
  }, [slides.length]);

  const go = (idx: number) => {
    if (!slides.length) return;
    setActive((idx + slides.length) % slides.length);
  };

  const next = () => go(active + 1);
  const prev = () => go(active - 1);

  const current = slides[active];

  // ✅ Use publishedAt first (WordPress date)
  const currentDate = current?.publishedAt || current?.date;

  // ✅ WP permalink format: /YYYY/MM/DD/slug/
  const heroHref = buildWpPermalink(currentDate, current?.slug);

  return (
    <section className="home-hero">
      <div className="container">
        <div className="row g-4">
          {/* HERO: col-7 on large screens, full width on mobile */}
          <div className="col-12 col-lg-7">
            <div className="hero-slider">
              <div className="hero-image-wrap">
                <Link href={heroHref} aria-label={current?.title || "Read story"}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={current?.image || "/placeholder.jpg"}
                    alt={current?.title || "Featured"}
                    style={{
                      cursor: heroHref !== "#" ? "pointer" : "default",
                    }}
                  />
                </Link>

                <button
                  type="button"
                  className="hero-arrow left"
                  onClick={prev}
                  aria-label="Previous slide"
                >
                  ‹
                </button>
                <button
                  type="button"
                  className="hero-arrow right"
                  onClick={next}
                  aria-label="Next slide"
                >
                  ›
                </button>
              </div>

              <div className="hero-content">
                <div className="hero-date">
                  📅 {formatDateStable(currentDate)}
                </div>

                <h1 className="hero-title">
                  <Link
                    href={heroHref}
                    className="text-decoration-none text-dark"
                    style={{
                      pointerEvents: heroHref !== "#" ? "auto" : "none",
                    }}
                  >
                    {current?.title}
                  </Link>
                </h1>

                <div className="hero-dots">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`hero-dot ${i === active ? "active" : ""}`}
                      onClick={() => go(i)}
                      aria-label={`Go to slide ${i + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* MOVEMENTS: col-5 on large screens, full width on mobile */}
          <div className="col-12 col-lg-5">
            <aside className="movements-box h-100">
              <div className="movements-header">
                <h3>Movements News</h3>
              </div>

              <div className="movements-list">
                {movements?.map((m) => {
                  const mDate = m?.publishedAt || m?.date; // ✅ consistent
                  const href = buildWpPermalink(mDate, m?.slug);

                  return (
                    <div key={m.id} className="movements-item">
                      <Link
                        href={href}
                        className="movements-title text-decoration-none"
                        style={{
                          pointerEvents: href !== "#" ? "auto" : "none",
                        }}
                      >
                        {m.title}
                      </Link>

                      <div className="movements-meta">
                        <span>👤 {m.author || "Cxomedia"}</span>
                        <span>📅 {formatDateStable(mDate)}</span>
                      </div>
                    </div>
                  );
                })}

                {!movements?.length ? (
                  <div className="p-3 text-muted">No movements posts found.</div>
                ) : null}
              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
