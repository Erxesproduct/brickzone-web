import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BuyBox } from "@/components/buy-box";
import { Gallery } from "@/components/gallery";
import { AgeIcon, BrickIcon, CardIcon, PhoneIcon, PlayIcon, RulerIcon, ScaleIcon, TruckIcon } from "@/components/icons";
import { ProductGrid } from "@/components/product-card";
import { SectionHead } from "@/components/section";
import { business } from "@/content/business";
import { colorOf } from "@/content/look";
import { byShelf, discount, getCategory, getProduct, products, sku, soldOut, subName } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { absoluteUrl } from "@/lib/site-url";

export const dynamicParams = false;
export const generateStaticParams = () => products.map((p) => ({ slug: p.slug }));

const describe = (p: NonNullable<ReturnType<typeof getProduct>>) =>
  [subName(p), p.pieces && `${p.pieces.toLocaleString("en-US")} ширхэг`, p.size, p.age && `${p.age} нас`, p.scale && `харьцаа ${p.scale}`, ...p.features].filter(Boolean).join(". ").slice(0, 160);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProduct((await params).slug);
  if (!p) return {};
  const description = describe(p);
  const img = p.images[0];
  return {
    title: p.name,
    description,
    alternates: { canonical: `/p/${p.slug}` },
    openGraph: { type: "website", title: p.name, description, images: [{ url: img.src, width: img.w, height: img.h }] },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const cat = getCategory(p.category)!;
  const sub = cat.subs.find((s) => p.sub.includes(s.id));
  const off = discount(p);
  const out = soldOut(p);
  const color = colorOf(p.category);
  const specs = [
    p.pieces && { icon: BrickIcon, k: "Ширхэг", v: p.pieces.toLocaleString("en-US") },
    p.size && { icon: RulerIcon, k: "Хэмжээ", v: p.size },
    p.age && { icon: AgeIcon, k: "Нас", v: p.age },
    p.scale && { icon: ScaleIcon, k: "Харьцаа", v: p.scale },
  ].filter(Boolean) as { icon: typeof BrickIcon; k: string; v: string }[];
  const same = products.filter((x) => x.id !== p.id && x.category === p.category);
  const related = [...same.filter((x) => sub && x.sub.includes(sub.id)), ...same.filter((x) => !sub || !x.sub.includes(sub.id))]
    .filter((x) => !soldOut(x))
    .slice(0, 5);
  const fill = related.length < 5 ? products.filter((x) => x.id !== p.id && !related.includes(x) && !soldOut(x)).sort(byShelf).slice(0, 5 - related.length) : [];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    ...(p.brand && { brand: { "@type": "Brand", name: p.brand } }),
    category: [cat.name, sub?.name].filter(Boolean).join(" / "),
    image: p.images.map((i) => absoluteUrl(i.src)),
    description: describe(p),
    sku: sku(p),
    offers: {
      "@type": "Offer",
      price: p.price,
      priceCurrency: "MNT",
      availability: out ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
      url: absoluteUrl(`/p/${p.slug}`),
      seller: { "@type": "Organization", name: business.name },
    },
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Зам" className="flex flex-wrap items-center gap-1.5 text-[13.5px] text-mute">
        <Link href="/shop" className="hover:text-brick">
          Дэлгүүр
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/shop?category=${cat.id}`} className="hover:text-brick">
          {cat.name}
        </Link>
        {sub && (
          <>
            <span aria-hidden>/</span>
            <Link href={`/shop?category=${cat.id}&sub=${sub.id}`} className="hover:text-brick">
              {sub.name}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Gallery images={p.images} name={p.name} soldOut={out} />
        </div>

        <div>
          <p className="label flex items-center gap-2 text-mute">
            <span className="h-2.5 w-4 rounded-[2px]" style={{ background: color.bg }} aria-hidden />
            {sub?.name ?? cat.name}
            {p.brand && <span className="rounded-md bg-white px-1.5 py-0.5 text-ink ring-1 ring-line">{p.brand}</span>}
          </p>
          <h1 className="display mt-2.5 text-[32px] leading-[1.08] font-bold sm:text-[42px]">{p.name}</h1>

          <div className="mt-5 flex flex-wrap items-end gap-x-3 gap-y-1">
            <p className={`display tnum text-[34px] leading-none font-bold ${off && !out ? "text-brick" : ""}`}>{formatPrice(p.price)}</p>
            {p.compareAt && off > 0 && (
              <>
                <s className="tnum pb-0.5 text-lg text-mute">{formatPrice(p.compareAt)}</s>
                <span className="display tnum mb-0.5 rounded-md bg-brick px-2 py-0.5 text-[13px] font-bold text-white">−{off}%</span>
              </>
            )}
          </div>
          <p className={`mt-2 text-[14px] font-semibold ${out ? "text-mute" : "text-teal"}`}>{out ? "Дууссан" : "Бэлэн байгаа"}</p>

          {specs.length > 0 && (
            <dl className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {specs.map(({ icon: Icon, k, v }) => (
                <div key={k} className="rounded-2xl bg-card p-3 ring-1 ring-line">
                  <dt className="flex items-center gap-1.5 text-[12px] text-mute">
                    <Icon size={15} /> {k}
                  </dt>
                  <dd className="display tnum mt-1 text-[16px] leading-tight font-bold">{v}</dd>
                </div>
              ))}
            </dl>
          )}

          <div className="mt-6">
            <BuyBox slug={p.slug} stock={p.stock} />
          </div>

          <div className="mt-6 divide-y divide-line rounded-2xl bg-card text-[14px] leading-relaxed text-ink-2 ring-1 ring-line">
            <div className="flex gap-3 p-4">
              <TruckIcon size={20} className="mt-0.5 shrink-0 text-brick" />
              <span>
                Хүргэлт {formatPrice(business.delivery[0].fee)}, <b className="text-ink">{formatPrice(business.freeFrom)}-өөс дээш үнэгүй</b>. {business.rules.delivery} Орон нутаг руу унаанд тавьж өгнө.
              </span>
            </div>
            <div className="flex gap-3 p-4">
              <CardIcon size={20} className="mt-0.5 shrink-0 text-teal" />
              <span>QPay. {business.rules.installment}</span>
            </div>
            <a href={`tel:${business.phone.tel}`} className="flex items-center gap-3 p-4 font-semibold text-ink hover:text-brick">
              <PhoneIcon size={20} className="shrink-0" /> Асуух зүйл байвал {business.phone.display}
            </a>
          </div>

          {p.features.length > 0 && (
            <section className="mt-8">
              <h2 className="display text-[18px] font-bold">Онцлог</h2>
              <ul className="mt-3 space-y-2 text-[15px] leading-relaxed text-ink-2">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5">
                    <span className="mt-2 h-2 w-3 shrink-0 rounded-[2px]" style={{ background: color.bg }} aria-hidden />
                    {f}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {p.video && (
            <a href={p.video} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-graphite-2">
              <PlayIcon size={18} /> Видеогоор үзэх (YouTube)
            </a>
          )}
        </div>
      </div>

      {related.length + fill.length > 0 && (
        <section className="mt-20">
          <SectionHead title={related.length ? `Бусад ${sub?.name ?? cat.name}` : "Мөн үзээрэй"} href={`/shop?category=${cat.id}${sub ? `&sub=${sub.id}` : ""}`} color={color.bg} />
          <div className="mt-6">
            <ProductGrid products={[...related, ...fill]} />
          </div>
        </section>
      )}
    </div>
  );
}
