// Writes src/data/lite.json: the few product fields client components need (cart, checkout, header search),
// so the browser bundle does not carry every description. Runs before `next build` and `next dev`.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const catalog = JSON.parse(readFileSync(path.join(root, "src", "data", "catalog.json"), "utf8"));

// same rules as src/lib/search.ts (kept in sync by hand; it is 20 lines)
const TR = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", ө: "u", п: "p", р: "r", с: "s", т: "t", у: "u", ү: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya" };
const fold = (s) => s.toLowerCase().replace(/ё/g, "е").replace(/ө/g, "о").replace(/ү/g, "у").replace(/[«»“”"'.,:;!?()\-–—/]/g, " ").replace(/\s+/g, " ").trim();
const latin = (s) => s.toLowerCase().split("").map((c) => TR[c] ?? c).join("").replace(/[^a-z0-9]+/g, " ").trim();
const searchKey = (parts) => {
  const text = parts.filter(Boolean).join(" ");
  const lat = latin(text);
  return ` ${fold(text)} ${lat} ${lat.replace(/kh/g, "h")} `;
};

const cats = new Map(catalog.categories.map((c) => [c.id, c]));
const subOf = (p) => cats.get(p.category)?.subs.find((x) => p.sub.includes(x.id))?.name ?? cats.get(p.category)?.name ?? "";
const lite = catalog.products.map((p) => ({
  s: p.slug,
  n: p.name,
  c: subOf(p),
  p: p.price,
  o: p.compareAt,
  k: p.stock,
  t: p.images[0].thumb.src,
  q: searchKey([p.name, p.brand, p.sku, cats.get(p.category)?.name, subOf(p)]),
}));
writeFileSync(path.join(root, "src", "data", "lite.json"), JSON.stringify(lite) + "\n");
console.log(`lite.json: ${lite.length} products`);
