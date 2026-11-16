import type { Metadata } from "next";
import Link from "next/link";
import { CloseIcon, SearchIcon } from "@/components/icons";
import { ProductGrid } from "@/components/product-card";
import { colorOf } from "@/content/look";
import { byShelf, categories, discount, getCategory, onSale, products, search, soldOut, type Product } from "@/lib/catalog";

type Params = { category?: string; sub?: string; sale?: string; q?: string; sort?: string; stock?: string };

const SORTS = [
  { id: "new", label: "Шинэ" },
  { id: "price-asc", label: "Үнэ ↑" },
  { id: "price-desc", label: "Үнэ ↓" },
  { id: "sale", label: "Хямдрал ихтэй" },
] as const;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const sp = await searchParams;
  const c = getCategory(one(sp.category) ?? "");
  const q = one(sp.q);
  const title = q ? `«${q}» хайлт` : one(sp.sale) ? "Хямдрал" : c ? c.name : "Дэлгүүр";
  return { title, description: c?.blurb, alternates: { canonical: c ? `/shop?category=${c.id}` : "/shop" }, ...(q && { robots: { index: false } }) };
}

export default async function Shop({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const p: Params = { category: one(sp.category), sub: one(sp.sub), sale: one(sp.sale), q: one(sp.q)?.trim().slice(0, 80), sort: one(sp.sort), stock: one(sp.stock) };
  const cat = p.category ? getCategory(p.category) : undefined;
  const sub = cat?.subs.find((s) => s.id === p.sub);
  const sort = SORTS.find((s) => s.id === p.sort)?.id ?? (p.q ? null : "new");

  let list: Product[] = p.q ? search(p.q) : [...products];
  if (cat) list = list.filter((x) => x.category === cat.id);
  if (sub) list = list.filter((x) => x.sub.includes(sub.id));
  if (p.sale) list = list.filter(onSale);
  if (p.stock) list = list.filter((x) => !soldOut(x));
  const order: Record<string, (a: Product, b: Product) => number> = {
    new: byShelf,
    "price-asc": (a, b) => Number(soldOut(a)) - Number(soldOut(b)) || a.price - b.price,
    "price-desc": (a, b) => Number(soldOut(a)) - Number(soldOut(b)) || b.price - a.price,
    sale: (a, b) => Number(soldOut(a)) - Number(soldOut(b)) || discount(b) - discount(a),
  };
  if (sort) list.sort(order[sort]);

  const href = (patch: Partial<Params>) => {
    const next = { ...p, ...patch };
    const qs = new URLSearchParams(Object.entries(next).filter(([, v]) => v) as [string, string][]).toString();
    return qs ? `/shop?${qs}` : "/shop";
  };
  const title = p.q ? `«${p.q}»` : sub ? sub.name : cat ? cat.name : p.sale ? "Хямдрал" : "Бүх загвар";
  const chip = "shrink-0 rounded-lg px-3 py-1.5 text-[13.5px] font-semibold ring-1 transition";
  const on = "bg-ink text-white ring-ink";
  const off = "bg-white text-ink-2 ring-line hover:text-ink hover:ring-ink";

  return (
    <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label text-mute">{cat && !p.q ? (sub ? cat.name : "Ангилал") : "Дэлгүүр"}</p>
          <h1 className="display mt-1.5 text-[32px] leading-tight font-bold sm:text-[42px]">{title}</h1>
          {cat && !sub && !p.q && <p className="mt-2 max-w-2xl text-[15px] text-ink-2">{cat.blurb}</p>}
        </div>
        <form action="/shop" className="w-full sm:w-auto" role="search">
          {cat && <input type="hidden" name="category" value={cat.id} />}
          <label className="flex h-11 items-center gap-2 rounded-xl bg-white px-3.5 ring-1 ring-line focus-within:ring-2 focus-within:ring-brick sm:w-72">
            <SearchIcon size={18} className="shrink-0 text-mute" />
            <span className="sr-only">Хайх</span>
            <input name="q" type="search" defaultValue={p.q} placeholder={cat ? `${cat.name} дотроос хайх` : "Бараа хайх"} className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-mute" />
          </label>
        </form>
      </div>

      {/* categories */}
      <nav aria-label="Ангилал" className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
        <Link href={href({ category: undefined, sub: undefined })} className={`${chip} ${!cat ? on : off}`}>
          Бүгд
        </Link>
        {categories.map((c) => (
          <Link key={c.id} href={href({ category: c.id, sub: undefined })} className={`${chip} flex items-center gap-1.5 ${cat?.id === c.id ? on : off}`}>
            <span className="h-2 w-3 rounded-[2px]" style={{ background: colorOf(c.id).bg }} aria-hidden />
            {c.name}
          </Link>
        ))}
      </nav>
      {cat && cat.subs.length > 0 && (
        <nav aria-label="Дэд ангилал" className="no-scrollbar -mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6">
          <Link href={href({ sub: undefined })} className={`${chip} ${!sub ? "bg-plate-2 text-ink ring-ink/30" : off}`}>
            Бүх {cat.name}
          </Link>
          {cat.subs.map((s) => (
            <Link key={s.id} href={href({ sub: s.id })} className={`${chip} ${sub?.id === s.id ? "bg-plate-2 text-ink ring-ink/30" : off}`}>
              {s.name} <span className="tnum text-mute">{s.count}</span>
            </Link>
          ))}
        </nav>
      )}

      {/* filters + sort */}
      <div className="mt-5 flex flex-wrap items-center gap-2 border-y border-line py-3">
        <Link href={href({ sale: p.sale ? undefined : "1" })} className={`${chip} ${p.sale ? "bg-brick text-white ring-brick" : off}`} aria-pressed={!!p.sale}>
          Хямдралтай
        </Link>
        <Link href={href({ stock: p.stock ? undefined : "1" })} className={`${chip} ${p.stock ? on : off}`} aria-pressed={!!p.stock}>
          Бэлэн байгаа
        </Link>
        {(p.q || p.sale || p.stock || cat) && (
          <Link href="/shop" className="flex items-center gap-1 px-2 text-[13px] font-semibold text-mute hover:text-brick">
            <CloseIcon size={14} /> Цэвэрлэх
          </Link>
        )}
        <span className="tnum ml-auto text-[13.5px] text-mute">{list.length} загвар</span>
        <div className="no-scrollbar flex w-full gap-1 overflow-x-auto sm:w-auto" aria-label="Эрэмбэ">
          {SORTS.map((s) => (
            <Link key={s.id} href={href({ sort: s.id === "new" ? undefined : s.id })} className={`shrink-0 rounded-lg px-2.5 py-1.5 text-[13px] font-semibold ${sort === s.id ? "bg-white text-ink ring-1 ring-ink" : "text-ink-2 hover:bg-white"}`}>
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {list.length ? (
          <ProductGrid products={list} priority={4} />
        ) : (
          <div className="rounded-2xl bg-card p-10 text-center ring-1 ring-line">
            <p className="display text-xl font-bold">Олдсонгүй</p>
            <p className="mt-2 text-ink-2">Өөр үгээр хайх эсвэл шүүлтүүрээ цэвэрлэнэ үү. Асуух зүйл байвал утсаар холбогдоорой.</p>
            <Link href="/shop" className="brick mt-6 inline-block rounded-xl bg-brick px-5 py-3 font-semibold text-white">
              Бүх загвар
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
