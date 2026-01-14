"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import StoryCard from "@/components/cards/StoryCard";

function StoryCardSkeleton() {
  return (
    <div className="story-skel">
      <div className="story-skel__img shimmer" />
      <div className="story-skel__body">
        <div className="story-skel__line shimmer" style={{ width: "92%" }} />
        <div className="story-skel__line shimmer" style={{ width: "78%" }} />
        <div className="story-skel__meta shimmer" style={{ width: "45%" }} />
        <div className="story-skel__para shimmer" style={{ width: "96%" }} />
        <div className="story-skel__para shimmer" style={{ width: "88%" }} />
        <div className="story-skel__para shimmer" style={{ width: "70%" }} />
      </div>
    </div>
  );
}

export default function CategoryCarouselSectionBootstrap({
  title,
  slug,
  posts,
  loading,
}: {
  title: string;
  slug: string; // ✅ NEW
  posts: any[];
  loading?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const items = posts || [];
  const showSkeleton = !!loading && (!items || items.length === 0);

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
  }, [items?.length]);

  const scroll = (dir: "l" | "r") => {
    const el = ref.current;
    if (!el) return;
    const dx = Math.round(el.clientWidth * 0.9);
    el.scrollBy({ left: dir === "l" ? -dx : dx, behavior: "smooth" });
  };

  return (
    <section className="container mt-4">
      <div className="section-head">
        <h2 className="section-title">{title}</h2>

        {/* ✅ View all goes to category page */}
        <Link href={`/category/${slug}`} className="section-link">
          View all →
        </Link>
      </div>

      <div className="carousel-wrap">
        <button
          type="button"
          onClick={() => scroll("l")}
          disabled={!canLeft}
          className={`carousel-arrow left ${canLeft ? "" : "disabled"}`}
          aria-label="Scroll left"
        >
          ‹
        </button>

        <div ref={ref} className="scroll-row no-scrollbar">
          <div className="d-flex gap-3 py-1">
            {(showSkeleton ? Array.from({ length: 6 }) : items).map((p: any, idx: number) => (
              <div key={p?.id ?? idx} className="carousel-item-width">
                {showSkeleton ? <StoryCardSkeleton /> : <StoryCard post={p} />}
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
