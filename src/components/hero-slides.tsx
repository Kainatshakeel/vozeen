"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
// Three hero panels that each cross-fade between photos while the active photo
// drifts (pan + zoom), so the still images feel like moving footage.
export function HeroSlides({
  panels,
}: {
  panels: { src: string; alt: string }[][];
}) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const timer = setInterval(() => setTick((t) => t + 1), 5000);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="hero-media">
      {panels.map((slides, p) => {
        // Panels change one after another instead of all at once.
        const active = Math.max(0, tick - p) % slides.length;
        return (
          <div className="hero-panel" key={p}>
            {slides.map((s, i) => (
              <Image
                key={`${i}-${s.src}`}
                src={s.src}
                alt={s.alt}
                fill
                priority={i === 0}
                sizes="(max-width: 860px) 100vw, 34vw"
                className={`hero-image kb-${(p + i) % 3} ${active === i ? "on" : ""}`}
              />
            ))}
          </div>
        );
      })}
      <div className="hero-shade" />
    </div>
  );
}
