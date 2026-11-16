"use client";

import { useState } from "react";
import { cart, maxQty, useCart } from "@/lib/cart";
import { CheckIcon, PlusIcon } from "./icons";

/** Small add-to-cart button on a product card (sits above the card's full-size link). */
export function QuickAdd({ slug, name }: { slug: string; name: string }) {
  const items = useCart();
  const [done, setDone] = useState(false);
  const inCart = items.find((i) => i.slug === slug)?.qty ?? 0;
  const full = inCart > 0 && inCart >= maxQty(slug);
  return (
    <button
      type="button"
      disabled={full}
      onClick={() => {
        cart.add(slug);
        setDone(true);
        setTimeout(() => setDone(false), 1400);
      }}
      aria-label={`${name}: сагсанд нэмэх`}
      title={full ? "Үлдэгдэл бүгд сагсанд байна" : "Сагсанд нэмэх"}
      className={`brick relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-xl text-white disabled:opacity-40 ${done ? "bg-teal [--lip:var(--color-teal-deep)]" : "bg-ink [--lip:#000]"}`}
    >
      {done ? <CheckIcon size={18} /> : <PlusIcon size={18} />}
      <span className="sr-only" role="status">
        {done ? "Сагсанд нэмлээ" : ""}
      </span>
    </button>
  );
}
