"use client";

import Image from "next/image";
import { useState } from "react";
import type { Photo } from "@/lib/catalog";

/** Product photos: one large on a white plate, thumbnails underneath. */
export function Gallery({ images, name, soldOut }: { images: Photo[]; name: string; soldOut: boolean }) {
  const [i, setI] = useState(0);
  const img = images[i];
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-white ring-1 ring-line sm:aspect-[5/4]">
        <Image key={img.src} src={img.src} alt={`${name}, ${i + 1}-р зураг`} fill priority sizes="(min-width: 1024px) 620px, 100vw" className={`rise object-contain p-4 sm:p-6 ${soldOut ? "opacity-60 grayscale" : ""}`} />
        {images.length > 1 && (
          <span className="tnum absolute right-3 bottom-3 rounded-md bg-ink/75 px-2 py-0.5 text-[12px] font-semibold text-white">
            {i + 1} / {images.length}
          </span>
        )}
      </div>
      {images.length > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto" role="tablist" aria-label="Зургууд">
          {images.map((x, k) => (
            <button
              key={x.src}
              type="button"
              role="tab"
              aria-selected={k === i}
              aria-label={`${k + 1}-р зураг`}
              onClick={() => setI(k)}
              className={`relative h-18 w-22 shrink-0 overflow-hidden rounded-xl bg-white ring-1 transition sm:h-20 sm:w-24 ${k === i ? "ring-2 ring-brick" : "ring-line hover:ring-ink"}`}
            >
              <Image src={x.thumb.src} alt="" fill sizes="96px" className="object-contain p-1" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
