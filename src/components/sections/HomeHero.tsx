"use client";

import { useEffect, useMemo, useRef, useState } from "react";
// import "bootstrap/dist/css/bootstrap.min.css";
// import "@/styles/home-hero.bootstrap.css";
import { formatDateStable } from "@/lib/date";
// import "@/styles/home-hero.css";

type HeroItem = {
  id: number | string;
  title: string;
  date?: string;
  slug?: string;
  image?: string | null;
};

type MovementItem = {
  id: number | string;
  title: string;
  date?: string;
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

  // ensure autoplay only starts AFTER mount
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

 return (
  <section className="home-hero">
    <div className="container">
      <div className="row g-4">
        {/* HERO: col-7 on large screens, full width on mobile */}
        <div className="col-12 col-lg-7">
          <div className="hero-slider">
            <div className="hero-image-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current?.image || "/placeholder.jpg"}
                alt={current?.title || "Featured"}
              />

              <button type="button" className="hero-arrow left" onClick={prev}>
                ‹
              </button>
              <button type="button" className="hero-arrow right" onClick={next}>
                ›
              </button>
            </div>

            <div className="hero-content">
              <div className="hero-date">
                📅 {formatDateStable(current?.date)}
              </div>

              <h1 className="hero-title">{current?.title}</h1>

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
              {movements?.map((m) => (
                <div key={m.id} className="movements-item">
                  <a href="#" className="movements-title">
                    {m.title}
                  </a>

                  <div className="movements-meta">
                    <span>👤 {m.author || "Cxomedia"}</span>
                    <span>📅 {formatDateStable(m.date)}</span>
                  </div>
                </div>
              ))}

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
