"use client";
import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/lib/catalog";
import { ProductCard } from "./product-card";
// Swipeable product row. With several groups it shows tabs above the row.
export function ProductCarousel({
  groups,
}: {
  groups: { label: string; products: Product[] }[];
}) {
  const track = useRef<HTMLDivElement>(null);
  const [tab, setTab] = useState(0);
  const products = groups[tab]?.products ?? [];
  function scroll(dir: 1 | -1) {
    const el = track.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  }
  return (
    <div className="carousel">
      <div className="carousel-bar">
        {groups.length > 1 ? (
          <div className="carousel-tabs" role="tablist">
            {groups.map((g, i) => (
              <button
                key={g.label}
                type="button"
                role="tab"
                aria-selected={tab === i}
                className={tab === i ? "on" : ""}
                onClick={() => {
                  setTab(i);
                  track.current?.scrollTo({ left: 0 });
                }}
              >
                {g.label}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <div className="carousel-arrows">
          <button type="button" aria-label="Previous" onClick={() => scroll(-1)}>
            <ChevronLeft size={20} />
          </button>
          <button type="button" aria-label="Next" onClick={() => scroll(1)}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
      <div className="carousel-track" ref={track}>
        {products.map((p, i) => (
          <div className="carousel-item" key={p.id}>
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </div>
    </div>
  );
}
