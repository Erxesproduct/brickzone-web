"use client";

import { useState } from "react";
import { CloseIcon, SearchIcon } from "./icons";
import { SearchBox } from "./search-box";

/** Wide screens: the search field sits in the header. */
export function SearchInline() {
  return (
    <div className="ml-4 hidden max-w-[320px] flex-1 lg:block">
      <SearchBox />
    </div>
  );
}

/** Narrow screens: a button that opens the search field under the header. */
export function SearchToggle() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} aria-label={open ? "Хайлт хаах" : "Бараа хайх"} className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-ink-2 ring-1 ring-line hover:text-ink lg:hidden">
        {open ? <CloseIcon size={19} /> : <SearchIcon size={19} />}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-40 border-b border-line bg-plate px-4 py-3 shadow-sm lg:hidden">
          <SearchBox autoFocus onDone={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
