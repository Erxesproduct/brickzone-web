"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Banner } from "@/lib/catalog";
import { ChevronIcon } from "./icons";

const DUR = 6000;

/** The shop's own Zochil banners, one after another. Each is shown whole (contain) over a blurred copy of itself. */
export function HeroSlider({ banners }: { banners: Banner[] }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = banners.length;

  useEffect(() => {
    if (paused || n < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setI((x) => (x + 1) % n), DUR);
    return () => clearTimeout(t);
  }, [i, paused, n]);

  const go = (k: number) => setI(((k % n) + n) % n);
  const b = banners[i];

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Онцлох"
      className="relative overflow-hidden rounded-3xl bg-graphite ring-1 ring-black/10"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative aspect-[4/3] sm:aspect-[16/10]">
        {banners.map((x, k) => (
          <Image key={x.id} src={x.image.src} alt="" aria-hidden fill sizes="10vw" className={`scale-110 object-cover blur-2xl transition-opacity duration-700 ${k === i ? "opacity-60" : "opacity-0"}`} />
        ))}
        <Link href={b.href ?? "/shop"} key={b.id} className="snap absolute inset-0 block" aria-roledescription="slide" aria-label={`${i + 1} / ${n}: ${b.title}`}>
          <Image src={b.image.src} alt={b.title} fill priority={i === 0} sizes="(min-width: 1024px) 760px, 100vw" className="object-contain" />
        </Link>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/75 to-transparent px-4 pt-10 pb-3.5 sm:px-5">
        <p className="display line-clamp-1 min-w-0 flex-1 text-[14px] font-semibold text-white sm:text-[16px]">{b.title}</p>
        <div className="pointer-events-auto flex shrink-0 items-center gap-1.5">
          {banners.map((x, k) => (
            <button key={x.id} type="button" onClick={() => go(k)} aria-label={`${k + 1}-р баннер`} aria-current={k === i} className="relative h-1.5 w-6 overflow-hidden rounded-full bg-white/30 sm:w-8">
              {k === i && <span key={`${i}-${paused}`} className={`absolute inset-0 rounded-full bg-amber ${paused ? "" : "progress"}`} style={{ ["--dur" as string]: `${DUR}ms` }} />}
              {k < i && <span className="absolute inset-0 rounded-full bg-white/70" />}
            </button>
          ))}
        </div>
      </div>

      {n > 1 && (
        <>
          <button type="button" onClick={() => go(i - 1)} aria-label="Өмнөх" className="absolute top-1/2 left-3 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-xl bg-white/85 text-ink shadow hover:bg-white sm:grid">
            <ChevronIcon size={20} className="rotate-180" />
          </button>
          <button type="button" onClick={() => go(i + 1)} aria-label="Дараах" className="absolute top-1/2 right-3 hidden h-10 w-10 -translate-y-1/2 place-items-center rounded-xl bg-white/85 text-ink shadow hover:bg-white sm:grid">
            <ChevronIcon size={20} />
          </button>
        </>
      )}
    </section>
  );
}
