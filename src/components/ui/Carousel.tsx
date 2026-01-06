"use client";
import { useEffect, useRef, useState } from "react";

export default function Carousel({
  children,
  itemWidthClass = "w-[280px] md:w-[300px] lg:w-[320px]",
  stepPx = 360,
}: {
  children: React.ReactNode[];
  itemWidthClass?: string;
  stepPx?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [left, setLeft] = useState(false);
  const [right, setRight] = useState(true);

  const update = () => {
    const el = ref.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setLeft(el.scrollLeft > 4);
    setRight(el.scrollLeft < max - 4);
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
    el.scrollBy({ left: dir === "l" ? -stepPx : stepPx, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <button
        onClick={() => scroll("l")}
        disabled={!left}
        className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full border bg-white shadow
          ${left ? "opacity-100" : "opacity-30 cursor-not-allowed"}`}
      >
        ‹
      </button>

      <div ref={ref} className="overflow-x-auto no-scrollbar scroll-smooth px-10">
        <div className="flex gap-4 py-1">
          {children.map((c, i) => (
            <div key={i} className={`shrink-0 snap-start ${itemWidthClass}`}>
              {c}
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={() => scroll("r")}
        disabled={!right}
        className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 h-9 w-9 rounded-full border bg-white shadow
          ${right ? "opacity-100" : "opacity-30 cursor-not-allowed"}`}
      >
        ›
      </button>
    </div>
  );
}
