"use client";

import Link from "next/link";
import { useState } from "react";
import { cart, maxQty, useCart } from "@/lib/cart";
import { BagIcon, CheckIcon, MinusIcon, PlusIcon } from "./icons";

export function BuyBox({ slug, stock }: { slug: string; stock: number | null }) {
  const items = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const inCart = items.find((i) => i.slug === slug)?.qty ?? 0;
  const cap = Math.max(0, maxQty(slug) - inCart);

  if (stock === 0)
    return (
      <div className="rounded-2xl bg-plate-2 p-4 text-[14.5px] text-ink-2">
        <b className="text-ink">Одоогоор дууссан.</b> Дахин ирэх эсэхийг утсаар лавлана уу.
      </div>
    );

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-12 items-center rounded-xl bg-white ring-1 ring-line">
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty <= 1} className="grid h-12 w-12 place-items-center rounded-xl hover:bg-plate disabled:opacity-35" aria-label="Цөөлөх">
            <MinusIcon size={16} />
          </button>
          <span className="tnum w-8 text-center font-bold" aria-live="polite">
            {qty}
          </span>
          <button type="button" onClick={() => setQty((q) => Math.min(Math.max(1, cap), q + 1))} disabled={qty >= cap} className="grid h-12 w-12 place-items-center rounded-xl hover:bg-plate disabled:opacity-35" aria-label="Нэмэх">
            <PlusIcon size={16} />
          </button>
        </div>
        <button
          type="button"
          disabled={cap <= 0}
          onClick={() => {
            cart.add(slug, Math.min(qty, cap));
            setAdded(true);
            setQty(1);
          }}
          className="brick flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-brick px-7 font-semibold text-white hover:bg-[#ea3546] disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
        >
          <BagIcon size={18} /> Сагслах
        </button>
      </div>
      {stock != null && stock > 0 && stock <= 3 && <p className="mt-2.5 text-[13px] font-semibold text-flame">Сүүлийн {stock} ширхэг үлдсэн.</p>}
      {cap <= 0 && inCart > 0 && <p className="mt-2 text-[13px] text-mute">Үлдэгдэл бүгд таны сагсанд байна.</p>}
      {added && (
        <p className="rise mt-3 flex items-center gap-2 text-[14px] font-semibold text-teal" role="status">
          <CheckIcon size={17} /> Сагсанд нэмлээ ({inCart} ш).
          <Link href="/cart" className="text-brick underline underline-offset-2">
            Захиалах
          </Link>
        </p>
      )}
    </div>
  );
}
