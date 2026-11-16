import data from "@/data/catalog.json";
import { matches, rank, searchKey } from "@/lib/search";

export type Img = { src: string; w: number; h: number };
export type Photo = Img & { thumb: Img };

export type Product = {
  /** Zochil product id (kept for the erxes product code and old-URL redirects). */
  id: number;
  slug: string;
  name: string;
  category: string;
  sub: string[];
  zochilCategoryIds: number[];
  brand: string | null;
  sku: string | null;
  /** Selling price (the sale price when discounted). */
  price: number;
  /** Price before the discount, null when not discounted. */
  compareAt: number | null;
  /** Units in stock; null = stock not tracked. 0 = sold out. */
  stock: number | null;
  createdAt: string;
  pieces: number | null;
  size: string | null;
  age: string | null;
  scale: string | null;
  /** Description lines that are not one of the specs above. */
  features: string[];
  video: string | null;
  images: Photo[];
};

export type Sub = { id: string; name: string; zochil: number; count: number };
export type Category = { id: string; name: string; blurb: string; zochil: number[]; subs: Sub[]; count: number };
export type Banner = { id: number; title: string; href: string | null; image: Img };
export type Post = { id: number; title: string; date: string; image: Img | null; body: string[]; tags: string[] };

export const categories = data.categories as Category[];
export const products = data.products as Product[];
export const banners = data.banners as Banner[];
export const posts = data.posts as Post[];
export const about = data.about as string[];
export const faq = data.faq as { q: string; a: string }[];
export const catalogUpdatedAt = data.updatedAt;

const bySlug = new Map(products.map((p) => [p.slug, p]));
export const getProduct = (slug: string) => bySlug.get(slug);
export const getCategory = (id: string) => categories.find((c) => c.id === id);
export const inCategory = (id: string, sub?: string) => products.filter((p) => p.category === id && (!sub || p.sub.includes(sub)));

export const soldOut = (p: { stock: number | null }) => p.stock === 0;
export const onSale = (p: Pick<Product, "price" | "compareAt">) => p.compareAt != null && p.compareAt > p.price;
export const discount = (p: Pick<Product, "price" | "compareAt">) => (onSale(p) ? Math.round((1 - p.price / p.compareAt!) * 100) : 0);
/** In stock first, then newest. */
export const byShelf = (a: Product, b: Product) => Number(soldOut(a)) - Number(soldOut(b)) || b.createdAt.localeCompare(a.createdAt);

export const subName = (p: Product) => getCategory(p.category)?.subs.find((s) => p.sub.includes(s.id))?.name ?? getCategory(p.category)?.name ?? "";

const keys = new Map(products.map((p) => [p.id, searchKey([p.name, p.brand, p.sku, getCategory(p.category)?.name, ...p.sub.map((s) => getCategory(p.category)?.subs.find((x) => x.id === s)?.name), ...p.features])]));
/** Search over name, brand, category and description; name matches first. */
export function search(query: string) {
  return products.filter((p) => matches(keys.get(p.id)!, query)).sort((a, b) => rank(b.name, query) - rank(a.name, query) || byShelf(a, b));
}

/** The product a cart line points at. */
export function resolveLine(slug: string) {
  const product = getProduct(slug);
  return product ? { product, price: product.price, stock: product.stock } : null;
}

/** erxes product code: BZ-<zochil id>. */
export const sku = (p: Pick<Product, "id">) => `BZ-${p.id}`;
