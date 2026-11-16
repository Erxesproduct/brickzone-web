import Image from "next/image";
import Link from "next/link";
import { business } from "@/content/business";
import { categories } from "@/lib/catalog";
import { ClockIcon, FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, PinIcon } from "./icons";

export function Footer() {
  return (
    <footer className="studs-dark mt-24 text-white/75">
      <div className="grad h-1.5" aria-hidden />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <Image src="/brand/logo.png" alt="" width={52} height={52} className="h-13 w-13 rounded-full bg-white" />
            <p className="display text-3xl font-bold text-white">BRICKZONE</p>
          </div>
          <p className="mt-4 max-w-sm text-[14.5px] leading-relaxed">{business.description}</p>
          <div className="mt-5 flex gap-2">
            <a href={business.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid h-10 w-10 place-items-center rounded-xl ring-1 ring-white/20 hover:bg-white/10">
              <FacebookIcon size={18} />
            </a>
            <a href={business.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-10 w-10 place-items-center rounded-xl ring-1 ring-white/20 hover:bg-white/10">
              <InstagramIcon size={18} />
            </a>
          </div>
        </div>
        <div>
          <p className="label text-amber">Ангилал</p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-[14px] md:grid-cols-1">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={`/shop?category=${c.id}`} className="hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/shop?sale=1" className="font-semibold text-amber hover:underline">
                Хямдрал
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="label text-amber">Дэлгүүр</p>
          <ul className="mt-3 space-y-2.5 text-[14.5px]">
            <li>
              <a href={business.mapUrl} target="_blank" rel="noopener noreferrer" className="flex gap-2 hover:text-white">
                <PinIcon size={16} className="mt-0.5 shrink-0" /> {business.address}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <ClockIcon size={16} className="shrink-0" /> {business.hours}
            </li>
            <li>
              <a href={`tel:${business.phone.tel}`} className="flex items-center gap-2 hover:text-white">
                <PhoneIcon size={16} /> <span className="tnum">{business.phone.display}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${business.email}`} className="flex items-center gap-2 break-all hover:text-white">
                <MailIcon size={16} className="shrink-0" /> {business.email}
              </a>
            </li>
            <li>
              <Link href="/info" className="font-semibold text-amber hover:underline">
                Хүргэлт, төлбөр, и-баримт
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-[12.5px] text-white/45 sm:px-6">© {new Date().getFullYear()} {business.name}. {business.tagline}.</p>
      </div>
    </footer>
  );
}
