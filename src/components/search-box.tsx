"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { formatPrice } from "@/lib/format";
import { liteProducts } from "@/lib/lite";
import { matches, rank } from "@/lib/search";
import { ArrowIcon, SearchIcon } from "./icons";

/** Header search: instant results from names, brands and categories; Enter opens the full results page. */
export function SearchBox({ autoFocus = false, onDone }: { autoFocus?: boolean; onDone?: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const box = useRef<HTMLDivElement>(null);
  const listId = useId();

  const results = q.trim() ? liteProducts.filter((p) => matches(p.q, q)).sort((a, b) => rank(b.n, q) - rank(a.n, q)) : [];
  const top = results.slice(0, 6);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const finish = (href: string) => {
    setOpen(false);
    setQ("");
    onDone?.();
    router.push(href);
  };

  return (
    <div ref={box} className="relative w-full">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (active >= 0 && top[active]) finish(`/p/${top[active].s}`);
          else if (q.trim()) finish(`/shop?q=${encodeURIComponent(q.trim())}`);
        }}
      >
        <label className="flex h-11 items-center gap-2 rounded-xl bg-white px-4 ring-1 ring-line focus-within:ring-2 focus-within:ring-brick">
          <SearchIcon size={18} className="shrink-0 text-mute" />
          <span className="sr-only">Бараа хайх</span>
          <input
            type="search"
            value={q}
            autoFocus={autoFocus}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(top.length - 1, a + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(-1, a - 1));
              } else if (e.key === "Escape") {
                setOpen(false);
                onDone?.();
              }
            }}
            placeholder="LEGO, RC, Ferrari… хайх"
            role="combobox"
            aria-expanded={open && !!q.trim()}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-mute [&::-webkit-search-cancel-button]:hidden"
          />
        </label>
      </form>

      {open && q.trim() && (
        <div className="rise absolute top-full right-0 left-0 z-40 mt-2 overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-line">
          {top.length ? (
            <ul id={listId} role="listbox" className="max-h-[70vh] overflow-y-auto py-1.5">
              {top.map((p, k) => (
                <li key={p.s} id={`${listId}-${k}`} role="option" aria-selected={k === active}>
                  <Link
                    href={`/p/${p.s}`}
                    onClick={(e) => {
                      e.preventDefault();
                      finish(`/p/${p.s}`);
                    }}
                    onMouseEnter={() => setActive(k)}
                    className={`flex items-center gap-3 px-3.5 py-2 ${k === active ? "bg-plate" : ""}`}
                  >
                    <Image src={p.t} alt="" width={48} height={48} className="h-12 w-12 shrink-0 rounded-lg bg-white object-contain ring-1 ring-line" />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 text-[14.5px] font-semibold">{p.n}</span>
                      <span className="line-clamp-1 text-[12.5px] text-mute">{p.c}</span>
                    </span>
                    <span className={`tnum shrink-0 text-[13.5px] font-bold ${p.k === 0 ? "text-mute line-through" : ""}`}>{formatPrice(p.p)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-4 text-[14px] text-ink-2">«{q.trim()}»: нэрээр олдсонгүй. Тайлбараас хайх бол Enter дарна уу.</p>
          )}
          <Link
            href={`/shop?q=${encodeURIComponent(q.trim())}`}
            onClick={(e) => {
              e.preventDefault();
              finish(`/shop?q=${encodeURIComponent(q.trim())}`);
            }}
            className="flex items-center justify-between border-t border-line px-4 py-3 text-[13.5px] font-bold text-brick hover:bg-plate"
          >
            Бүх үр дүн{results.length ? ` (${results.length})` : ""} <ArrowIcon size={15} />
          </Link>
        </div>
      )}
    </div>
  );
}
