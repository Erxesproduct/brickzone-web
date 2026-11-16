"use client";

import Link from "next/link";
import { cartCount, useCart } from "@/lib/cart";
import { BagIcon } from "./icons";

export function CartLink() {
  const n = cartCount(useCart());
  return (
    <Link href="/cart" className="brick relative grid h-11 w-11 place-items-center rounded-xl bg-brick text-white hover:bg-[#ea3546]" aria-label={n ? `Сагс, ${n} бараа` : "Сагс"}>
      <BagIcon size={20} />
      {n > 0 && <span className="tnum absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-amber px-1 text-[11px] font-bold text-ink ring-2 ring-plate">{n}</span>}
    </Link>
  );
}
