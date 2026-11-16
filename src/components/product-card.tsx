import Image from "next/image";
import Link from "next/link";
import { colorOf } from "@/content/look";
import { discount, soldOut, subName, type Product } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { BrickIcon } from "./icons";
import { QuickAdd } from "./quick-add";

/** A product on a shelf: photo on a white plate, category brick, name, pieces, price, one-tap add. */
export function ProductCard({ product: p, priority = false }: { product: Product; priority?: boolean }) {
  const img = p.images[0];
  const off = discount(p);
  const out = soldOut(p);
  const c = colorOf(p.category);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-line transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-ink/5">
      <div className="relative aspect-[4/3] bg-white">
        <Image src={img.thumb.src} alt="" fill priority={priority} sizes="(min-width: 1280px) 300px, (min-width: 640px) 33vw, 50vw" className={`object-contain p-3 transition duration-300 group-hover:scale-[1.04] ${out ? "opacity-45 grayscale" : ""}`} />
        <span className="absolute top-2.5 left-2.5 flex flex-col items-start gap-1">
          {off > 0 && !out && <span className="display tnum rounded-md bg-brick px-1.5 py-0.5 text-[12px] font-bold text-white">−{off}%</span>}
          {out && <span className="rounded-md bg-ink px-1.5 py-0.5 text-[11.5px] font-semibold text-white">Дууссан</span>}
          {p.stock != null && p.stock > 0 && p.stock <= 2 && <span className="rounded-md bg-amber px-1.5 py-0.5 text-[11.5px] font-semibold text-ink">Сүүлийн {p.stock}</span>}
        </span>
      </div>
      <div className="flex flex-1 flex-col border-t border-line p-3.5 pt-3">
        <p className="label flex items-center gap-1.5 text-[10px] text-mute">
          <span className="h-2 w-3 shrink-0 rounded-[2px]" style={{ background: c.bg }} aria-hidden />
          <span className="truncate">{subName(p)}</span>
        </p>
        <h3 className="mt-1.5 line-clamp-2 text-[15px] leading-snug font-semibold">
          <Link href={`/p/${p.slug}`} className="after:absolute after:inset-0 hover:text-brick">
            {p.name}
          </Link>
        </h3>
        {p.pieces && (
          <p className="tnum mt-1 flex items-center gap-1 text-[12.5px] text-mute">
            <BrickIcon size={14} /> {p.pieces.toLocaleString("en-US")} ширхэг
          </p>
        )}
        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          <p className="tnum leading-tight">
            <span className={`display block text-[17px] font-bold ${off && !out ? "text-brick" : ""}`}>{formatPrice(p.price)}</span>
            {p.compareAt && off > 0 && <s className="text-[12.5px] text-mute">{formatPrice(p.compareAt)}</s>}
          </p>
          {!out && <QuickAdd slug={p.slug} name={p.name} />}
        </div>
      </div>
    </article>
  );
}

/** Responsive grid of cards. */
export function ProductGrid({ products, priority = 0 }: { products: Product[]; priority?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
      {products.map((p, k) => (
        <ProductCard key={p.id} product={p} priority={k < priority} />
      ))}
    </div>
  );
}
