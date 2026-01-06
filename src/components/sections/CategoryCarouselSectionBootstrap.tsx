"use client";

import { useEffect, useRef, useState } from "react";
import StoryCard from "@/components/cards/StoryCard";

export default function CategoryCarouselSectionBootstrap({
  title,
  posts,
}: {
  title: string;
  posts: any[];
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < max - 4);
  };

  useEffect(() => {
    update();
    const el = ref.current;
    if (!el) return;
    const onScroll = () => update();
    el.addEventListener("scroll", onScroll, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, []);

  const scroll = (dir: "l" | "r") => {
    const el = ref.current;
    if (!el) return;
    const step = Math.max(280, Math.floor(el.clientWidth * 0.8));
    el.scrollBy({ left: dir === "l" ? -step : step, behavior: "smooth" });
  };

  if (!posts?.length) return null;

  return (
    <section className="container mt-4">
      {/* Heading row (Bootstrap) */}
      <div className="d-flex align-items-end justify-content-between border-bottom pb-2 mb-3">
        <h2 className="m-0 section-title">{title}</h2>
        <a href="#" className="small text-secondary text-decoration-none">
          View all →
        </a>
      </div>

      {/* Carousel row */}
      <div className="position-relative">
        <button
          type="button"
          onClick={() => scroll("l")}
          disabled={!canLeft}
          className={`carousel-arrow left ${canLeft ? "" : "disabled"}`}
          aria-label="Scroll left"
        >
          ‹
        </button>

        <div ref={ref} className="scroll-row no-scrollbar px-5">
          <div className="d-flex gap-3 py-1">
            {posts.map((p: any) => (
              <div key={p.id} className="carousel-item-width">
                <StoryCard post={p} />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => scroll("r")}
          disabled={!canRight}
          className={`carousel-arrow right ${canRight ? "" : "disabled"}`}
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </section>
  );
}
