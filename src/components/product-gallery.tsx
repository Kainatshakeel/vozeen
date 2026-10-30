"use client";
import Image from "next/image";
import { useRef, useState } from "react";
// Desktop: stacked editorial grid. Phone: swipeable full-width carousel.
export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  function onScroll() {
    const el = track.current;
    if (!el) return;
    setCurrent(Math.round(el.scrollLeft / el.clientWidth));
  }
  function go(i: number) {
    const el = track.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  }
  return (
    <div className="gallery">
      <div className="gallery-track" ref={track} onScroll={onScroll}>
        {images.map((src, i) => (
          <div className={`gallery-item ${i === 0 ? "first" : ""}`} key={src + i}>
            <Image
              src={src}
              alt={`${name}, view ${i + 1}`}
              fill
              priority={i < 2}
              sizes="(max-width: 860px) 100vw, 30vw"
            />
          </div>
        ))}
      </div>
      {images.length > 1 && (
        <div className="gallery-dots" role="tablist" aria-label="Product photos">
          <span className="gallery-count">
            {current + 1} / {images.length}
          </span>
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={current === i}
              aria-label={`Show photo ${i + 1}`}
              className={current === i ? "on" : ""}
              onClick={() => go(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
