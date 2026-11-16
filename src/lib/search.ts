/**
 * Forgiving search for Mongolian and Latin product names (shared by the header search and /shop?q=).
 * - case-insensitive, ё→е, and ө/ү typed as о/у still match;
 * - Latin typing matches too: "ekskavator", "mashin".
 */
const TR: Record<string, string> = { а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", ө: "u", п: "p", р: "r", с: "s", т: "t", у: "u", ү: "u", ф: "f", х: "kh", ц: "ts", ч: "ch", ш: "sh", щ: "sh", ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya" };

export const fold = (s: string) =>
  s
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/ө/g, "о")
    .replace(/ү/g, "у")
    .replace(/[«»“”"'.,:;!?()\-–—/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const latin = (s: string) =>
  s
    .toLowerCase()
    .split("")
    .map((c) => TR[c] ?? c)
    .join("")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

/** Search key for a record: folded Cyrillic + Latin (with both "kh" and "h" for х). */
export function searchKey(parts: (string | null | undefined)[]) {
  const text = parts.filter(Boolean).join(" ");
  const lat = latin(text);
  return ` ${fold(text)} ${lat} ${lat.replace(/kh/g, "h")} `;
}

/** Every word of the query must appear in the key. */
export function matches(key: string, query: string) {
  const words = fold(query).split(" ").filter(Boolean);
  return words.length > 0 && words.every((w) => key.includes(w));
}

/** Higher is better: title start > title word > anywhere. */
export function rank(title: string, query: string) {
  const t = ` ${fold(title)} `;
  const q = fold(query);
  if (t.startsWith(` ${q}`)) return 3;
  if (t.includes(` ${q}`)) return 2;
  return t.includes(q) ? 1 : 0;
}
