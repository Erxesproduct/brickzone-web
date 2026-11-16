import Image from "next/image";
import Link from "next/link";
import { HeroSlider } from "@/components/hero-slider";
import { ArrowIcon, ClockIcon, FacebookIcon, InstagramIcon, PhoneIcon, PinIcon, TruckIcon } from "@/components/icons";
import { ProductCard, ProductGrid } from "@/components/product-card";
import { SectionHead } from "@/components/section";
import { business } from "@/content/business";
import { colorOf } from "@/content/look";
import { about, banners, byShelf, categories, discount, inCategory, onSale, posts, products, soldOut } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

/** A category's cover: its newest in-stock product with a wide photo. */
const coverOf = (id: string) => {
  const list = inCategory(id).sort(byShelf);
  return (list.find((p) => !soldOut(p) && p.images[0].w >= p.images[0].h) ?? list[0]).images[0];
};

const shelves = [
  { id: "lego-cars", kicker: "Hypercar · Спорт · F1 · Жийп", title: "LEGO машин" },
  { id: "rc", kicker: "Алсын удирдлагатай", title: "RC техник" },
  { id: "military", kicker: "Танк · Хуягт · Онгоц · Хөлөг", title: "Цэргийн загвар" },
  { id: "frames", kicker: "Ханын жааз, тоосны хорго", title: "Жааз, хорго" },
  { id: "diecast", kicker: "Төмөр биетэй жижиг машин", title: "Diecast" },
];

export default function Home() {
  const sale = products.filter((p) => onSale(p) && !soldOut(p)).sort((a, b) => discount(b) - discount(a));
  const best = Math.max(...sale.map(discount));
  const inStock = products.filter((p) => !soldOut(p)).length;
  const intro = about.filter((l) => !/^Бидний (тухай|зорилго)/.test(l));

  return (
    <>
      {/* hero */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:gap-6">
          <HeroSlider banners={banners} />
          <section className="relative flex flex-col overflow-hidden rounded-3xl bg-card p-6 ring-1 ring-line sm:p-8">
            <div className="stud-row absolute inset-x-6 top-0" aria-hidden />
            <p className="label text-teal">Builder community · Улаанбаатар</p>
            <h1 className="display mt-3 text-[34px] leading-[1.05] font-bold sm:text-[44px]">
              Угсар. <span className="grad-text">Удирд.</span> Цуглуул.
            </h1>
            <p className="mt-4 text-[15.5px] leading-relaxed text-ink-2">{business.description}</p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link href="/shop" className="brick inline-flex items-center gap-2 rounded-xl bg-brick px-5 py-3 font-semibold text-white">
                Дэлгүүр үзэх <ArrowIcon size={17} />
              </Link>
              <Link href="/shop?sale=1" className="brick inline-flex items-center gap-2 rounded-xl bg-amber px-5 py-3 font-semibold text-ink [--lip:#c97c05]">
                −{best}% хүртэл
              </Link>
            </div>
            <dl className="tnum mt-auto grid grid-cols-3 gap-2 pt-8 text-center">
              {[
                [String(inStock), "бэлэн загвар"],
                [String(categories.length), "ангилал"],
                ["24–48ц", "хүргэлт"],
              ].map(([v, k]) => (
                <div key={k} className="rounded-xl bg-plate px-2 py-3">
                  <dt className="sr-only">{k}</dt>
                  <dd className="display text-[20px] font-bold sm:text-[22px]">{v}</dd>
                  <dd className="text-[12px] text-mute">{k}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>

      {/* categories as bricks */}
      <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6" aria-labelledby="cats">
        <h2 id="cats" className="sr-only">
          Ангилал
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c) => {
            const col = colorOf(c.id);
            const img = coverOf(c.id);
            const light = col.ink === "light";
            return (
              <Link
                key={c.id}
                href={`/shop?category=${c.id}`}
                className="brick group relative flex flex-col overflow-hidden rounded-2xl"
                style={{ background: col.bg, ["--lip" as string]: col.lip }}
              >
                <div className="stud-row mx-3 mt-2 opacity-70 [--stud:rgb(255_255_255/0.28)]" aria-hidden />
                <div className="flex items-start justify-between gap-2 px-3.5 pt-2">
                  <p className={`display text-[16px] leading-tight font-bold sm:text-[17px] ${light ? "text-white" : "text-ink"}`}>{c.name}</p>
                  <span className={`tnum shrink-0 rounded-md px-1.5 py-0.5 text-[11.5px] font-semibold ${light ? "bg-white/20 text-white" : "bg-black/10 text-ink"}`}>{c.count}</span>
                </div>
                <div className="relative mx-2.5 mt-3 mb-2.5 aspect-[16/10] overflow-hidden rounded-xl bg-white">
                  <Image src={img.thumb.src} alt="" fill sizes="(min-width: 1024px) 240px, 45vw" className="object-contain p-1.5 transition duration-300 group-hover:scale-105" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* sale */}
      {sale.length > 0 && (
        <section className="studs-dark mt-16 py-12 text-white" aria-labelledby="sale">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="label text-amber">Black Friday</p>
                <h2 id="sale" className="display mt-1.5 text-[28px] leading-tight font-bold sm:text-[36px]">
                  Хямдралтай <span className="grad-text">{sale.length} загвар</span>
                </h2>
                <p className="mt-1.5 text-[14.5px] text-white/65">−{best}% хүртэл, үлдэгдэл цөөн.</p>
              </div>
              <Link href="/shop?sale=1" className="flex shrink-0 items-center gap-1.5 rounded-xl bg-white/10 px-3.5 py-2 text-[13.5px] font-semibold ring-1 ring-white/20 hover:bg-white/15">
                Бүгд <ArrowIcon size={15} />
              </Link>
            </div>
            <div className="no-scrollbar -mx-4 mt-7 flex snap-x gap-3 overflow-x-auto px-4 pb-2 text-ink sm:-mx-6 sm:gap-4 sm:px-6">
              {sale.slice(0, 12).map((p) => (
                <div key={p.id} className="w-[220px] shrink-0 snap-start sm:w-[250px]">
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* shelves */}
      {shelves.map((s) => {
        const c = categories.find((x) => x.id === s.id)!;
        const list = inCategory(s.id).sort(byShelf).slice(0, 5);
        return (
          <section key={s.id} className="mx-auto mt-16 max-w-7xl px-4 sm:px-6">
            <SectionHead title={s.title} kicker={s.kicker} href={`/shop?category=${s.id}`} cta={`Бүх ${c.count} загвар`} color={colorOf(s.id).bg} />
            {c.subs.length > 0 && (
              <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto">
                {c.subs.map((sub) => (
                  <Link key={sub.id} href={`/shop?category=${c.id}&sub=${sub.id}`} className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-[13px] font-semibold text-ink-2 ring-1 ring-line hover:text-ink hover:ring-ink">
                    {sub.name} <span className="tnum text-mute">{sub.count}</span>
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-5">
              <ProductGrid products={list} />
            </div>
          </section>
        );
      })}

      {/* community */}
      <section className="mx-auto mt-20 max-w-7xl px-4 sm:px-6" aria-labelledby="community">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div className="relative overflow-hidden rounded-3xl bg-teal p-7 text-white sm:p-9">
            <div className="stud-row absolute inset-x-6 top-0 [--stud:rgb(255_255_255/0.22)]" aria-hidden />
            <p className="label text-white/70">Бидний тухай</p>
            <h2 id="community" className="display mt-2 text-[28px] leading-tight font-bold sm:text-[34px]">
              Builder community
            </h2>
            <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-white/90">
              {intro.map((l) => (
                <p key={l}>{l.replace(/^🔹\s*/, "▸ ")}</p>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <a href={business.facebook} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-[14px] font-semibold text-teal-deep hover:bg-mint">
                <FacebookIcon size={17} /> Facebook
              </a>
              <a href={business.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-[14px] font-semibold ring-1 ring-white/40 hover:bg-white/10">
                <InstagramIcon size={17} /> Instagram
              </a>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {posts.slice(0, 3).map((p) => (
              <article key={p.id} className="flex flex-col overflow-hidden rounded-2xl bg-card ring-1 ring-line">
                {p.image && (
                  <div className="relative aspect-square bg-white">
                    <Image src={p.image.src} alt="" fill sizes="(min-width: 640px) 240px, 100vw" className="object-cover" />
                  </div>
                )}
                <div className="flex flex-1 flex-col p-4">
                  <time dateTime={p.date} className="tnum text-[12px] text-mute">
                    {p.date.replaceAll("-", ".")}
                  </time>
                  <p className="mt-1.5 line-clamp-4 text-[14px] leading-snug font-medium">{p.title}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* visit */}
      <section className="mx-auto mt-16 max-w-7xl px-4 sm:px-6" aria-labelledby="visit">
        <div className="grid gap-4 rounded-3xl bg-card p-6 ring-1 ring-line sm:p-8 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <p className="label text-brick">Дэлгүүрээр зочлох</p>
            <h2 id="visit" className="display mt-2 text-[24px] leading-tight font-bold sm:text-[28px]">
              Андууд Старс төв, Б заал
            </h2>
            <a href={business.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-3 flex gap-2 text-[14.5px] text-ink-2 hover:text-brick">
              <PinIcon size={17} className="mt-0.5 shrink-0" /> {business.address}
            </a>
          </div>
          <ul className="space-y-3 text-[14.5px]">
            <li className="flex items-center gap-2.5">
              <ClockIcon size={18} className="text-teal" /> {business.hours}
            </li>
            <li>
              <a href={`tel:${business.phone.tel}`} className="flex items-center gap-2.5 font-semibold hover:text-brick">
                <PhoneIcon size={18} className="text-teal" /> <span className="tnum">{business.phone.display}</span>
              </a>
            </li>
          </ul>
          <div className="flex gap-3 rounded-2xl bg-plate p-4 text-[14px] leading-relaxed text-ink-2">
            <TruckIcon size={20} className="mt-0.5 shrink-0 text-brick" />
            <span>
              Хүргэлт {formatPrice(business.delivery[0].fee)}, <b className="text-ink">{formatPrice(business.freeFrom)}-өөс дээш үнэгүй.</b> Орон нутаг руу унаанд тавьж өгнө.{" "}
              <Link href="/info" className="font-semibold text-brick hover:underline">
                Дэлгэрэнгүй
              </Link>
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
