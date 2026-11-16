import Link from "next/link";
import { ArrowIcon } from "./icons";

/** Section heading: a coloured brick, a title, and an optional «see all» link. */
export function SectionHead({ title, kicker, href, cta = "Бүгдийг үзэх", color = "#e2283a" }: { title: string; kicker?: string; href?: string; cta?: string; color?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        <span className="flex gap-1" aria-hidden>
          <span className="h-2.5 w-5 rounded-t-[3px]" style={{ background: color }} />
          <span className="h-2.5 w-5 rounded-t-[3px] opacity-60" style={{ background: color }} />
        </span>
        {kicker && <p className="label mt-3 text-mute">{kicker}</p>}
        <h2 className="display mt-1.5 text-[26px] leading-tight font-bold sm:text-[32px]">{title}</h2>
      </div>
      {href && (
        <Link href={href} className="group flex shrink-0 items-center gap-1.5 rounded-xl bg-white px-3.5 py-2 text-[13.5px] font-semibold ring-1 ring-line hover:ring-ink">
          <span className="hidden sm:inline">{cta}</span>
          <span className="sm:hidden">Бүгд</span>
          <ArrowIcon size={15} className="transition group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
}
