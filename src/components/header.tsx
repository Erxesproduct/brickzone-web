import Image from "next/image";
import Link from "next/link";
import { business } from "@/content/business";
import { CartLink } from "./cart-link";
import { SearchInline, SearchToggle } from "./header-search";
import { PhoneIcon } from "./icons";

const nav = [
  { href: "/shop", label: "Дэлгүүр" },
  { href: "/shop?category=lego-cars", label: "LEGO машин" },
  { href: "/shop?category=rc", label: "RC техник" },
  { href: "/shop?sale=1", label: "Хямдрал", hot: true },
  { href: "/info", label: "Хүргэлт" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-plate/90 backdrop-blur-md">
      <div className="grad h-1" aria-hidden />
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:h-[72px] sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2.5" aria-label={`${business.name}: нүүр`}>
          <Image src="/brand/logo.png" alt="" width={44} height={44} priority className="h-10 w-10 rounded-full bg-white sm:h-11 sm:w-11" />
          <span className="leading-none">
            <span className="display block text-[19px] font-bold tracking-tight">BRICKZONE</span>
            <span className="label mt-1 block text-[9px] text-mute">LEGO · RC · MOC</span>
          </span>
        </Link>
        <SearchInline />
        <nav aria-label="Үндсэн цэс" className="ml-auto hidden items-center gap-0.5 md:flex">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className={`rounded-lg px-3 py-2 text-[14px] font-semibold hover:bg-white ${n.hot ? "text-brick" : "text-ink-2 hover:text-ink"}`}>
              {n.label}
            </Link>
          ))}
        </nav>
        <a href={`tel:${business.phone.tel}`} className="hidden items-center gap-1.5 text-[13.5px] font-semibold text-ink-2 hover:text-brick xl:flex">
          <PhoneIcon size={16} />
          <span className="tnum">{business.phone.display}</span>
        </a>
        <div className="ml-auto flex items-center gap-2 md:ml-0">
          <SearchToggle />
          <CartLink />
        </div>
      </div>
      <nav aria-label="Цэс" className="no-scrollbar flex gap-1 overflow-x-auto border-t border-line px-3 py-1.5 md:hidden">
        {nav.map((n) => (
          <Link key={n.href} href={n.href} className={`shrink-0 rounded-lg px-3 py-1.5 text-[13.5px] font-semibold hover:bg-white ${n.hot ? "text-brick" : "text-ink-2"}`}>
            {n.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
