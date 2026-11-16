"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { business, deliveryFee, type DeliveryId } from "@/content/business";
import { cart, cartSubtotal, maxQty, useCart } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { resolveLine } from "@/lib/lite";
import type { OrderErrors } from "@/lib/orders/schema";
import { BagIcon, CheckIcon, MinusIcon, PhoneIcon, PlusIcon, TrashIcon, TruckIcon } from "./icons";

type Done = { reference: string; total: number; deliveryFee: number; lines: { name: string; qty: number; total: number }[] };

const field = "mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-3 text-[15px] outline-none focus:border-brick aria-invalid:border-brick aria-invalid:bg-[#fdecee]";
const INSTALLMENT = "[SocialPay/ArdPay 6 хуваан төлөх хүсэлттэй]";

export function Checkout() {
  const items = useCart();
  const [delivery, setDelivery] = useState<DeliveryId>("city");
  const [receiptType, setReceiptType] = useState<"person" | "company">("person");
  const [installment, setInstallment] = useState(false);
  const [errors, setErrors] = useState<OrderErrors>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [done, setDone] = useState<Done | null>(null);

  const lines = items.flatMap((i) => {
    const l = resolveLine(i.slug);
    return l ? [{ ...i, line: l }] : [];
  });
  const subtotal = cartSubtotal(items);
  const fee = deliveryFee(delivery, subtotal);
  const total = subtotal + fee;
  const toFree = Math.max(0, business.freeFrom - subtotal);

  if (done) return <Receipt done={done} />;

  if (!lines.length)
    return (
      <div className="mx-auto max-w-xl rounded-2xl bg-card p-10 text-center ring-1 ring-line">
        <BagIcon size={40} className="mx-auto text-brick" />
        <p className="display mt-4 text-2xl font-bold">Сагс хоосон байна</p>
        <p className="mt-2 text-ink-2">Таалагдсан загвараа сонгоод «Сагслах» товчийг дарна уу.</p>
        <Link href="/shop" className="brick mt-6 inline-block rounded-xl bg-brick px-6 py-3 font-semibold text-white">
          Дэлгүүр үзэх
        </Link>
      </div>
    );

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const note = [installment ? INSTALLMENT : "", String(f.get("note") ?? "").trim()].filter(Boolean).join(" ");
    setBusy(true);
    setNotice(null);
    setErrors({});
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: f.get("name"),
          phone: f.get("phone"),
          email: f.get("email"),
          delivery,
          address: f.get("address") ?? "",
          payment: "qpay",
          receiptType,
          regNo: f.get("regNo") ?? "",
          note,
          website: f.get("website"),
          items: items.map(({ slug, qty }) => ({ slug, qty })),
        }),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.ok) {
        setDone({ reference: json.reference, total: json.total ?? total, deliveryFee: json.deliveryFee ?? fee, lines: lines.map((l) => ({ name: l.line.product.n, qty: l.qty, total: l.line.price * l.qty })) });
        cart.clear();
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (res.status === 422 && json?.errors) {
        setErrors(json.errors);
        setNotice("Мэдээллээ шалгаад дахин оролдоно уу.");
      } else if (json?.error === "not_configured") {
        setNotice(`Онлайн захиалгын систем тохируулагдаж байна. Захиалгаа ${business.phone.display} дугаарт утсаар өгнө үү (лавлах код ${json.reference}).`);
      } else {
        setNotice(`Захиалга илгээхэд алдаа гарлаа. Дахин оролдох эсвэл ${business.phone.display} дугаарт залгана уу.`);
      }
    } catch {
      setNotice("Интернэт холболтоо шалгаад дахин оролдоно уу.");
    } finally {
      setBusy(false);
    }
  }

  const err = (k: keyof OrderErrors) => errors[k] && <p className="mt-1 text-[13px] font-semibold text-brick">{errors[k]}</p>;
  const box = "rounded-2xl bg-card p-5 ring-1 ring-line";

  return (
    <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-[1.3fr_1fr]">
      <div className="space-y-5">
        <section className="rounded-2xl bg-card ring-1 ring-line">
          <h2 className="display border-b border-line px-5 py-4 font-bold">Сагсанд {lines.reduce((n, l) => n + l.qty, 0)} бараа</h2>
          <ul className="divide-y divide-line">
            {lines.map(({ slug, qty, line }) => (
              <li key={slug} className="flex gap-4 px-5 py-4">
                <Link href={`/p/${slug}`} className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-line">
                  <Image src={line.product.t} alt="" fill sizes="96px" className="object-contain p-1" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="label truncate text-[10px] text-mute">{line.product.c}</span>
                  <Link href={`/p/${slug}`} className="line-clamp-2 text-[15.5px] leading-snug font-semibold hover:text-brick">
                    {line.product.n}
                  </Link>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
                    <div className="flex items-center rounded-xl ring-1 ring-line">
                      <button type="button" onClick={() => cart.setQty(slug, qty - 1)} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-plate" aria-label="Цөөлөх">
                        <MinusIcon size={16} />
                      </button>
                      <span className="tnum w-7 text-center text-sm font-bold">{qty}</span>
                      <button type="button" onClick={() => cart.setQty(slug, qty + 1)} disabled={qty >= maxQty(slug)} className="grid h-9 w-9 place-items-center rounded-xl hover:bg-plate disabled:opacity-35" aria-label="Нэмэх">
                        <PlusIcon size={16} />
                      </button>
                    </div>
                    <span className="tnum font-bold">{formatPrice(line.price * qty)}</span>
                    <button type="button" onClick={() => cart.setQty(slug, 0)} className="grid h-9 w-9 place-items-center rounded-xl text-mute hover:bg-[#fdecee] hover:text-brick" aria-label="Хасах">
                      <TrashIcon size={17} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className={box}>
          <h2 className="display font-bold">Захиалагч</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">
              Нэр
              <input name="name" autoComplete="name" required aria-invalid={!!errors.name} className={field} />
              {err("name")}
            </label>
            <label className="text-sm font-semibold">
              Утас
              <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="99112233" required aria-invalid={!!errors.phone} className={field} />
              {err("phone")}
            </label>
            <label className="text-sm font-semibold sm:col-span-2">
              Имэйл <span className="font-normal text-mute">(заавал биш)</span>
              <input name="email" type="email" autoComplete="email" aria-invalid={!!errors.email} className={field} />
              {err("email")}
            </label>
          </div>
          <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
        </section>

        <section className={box}>
          <h2 className="display font-bold">Хүргэлт</h2>
          <div className="mt-3 grid gap-2.5 sm:grid-cols-2" role="radiogroup" aria-label="Хүргэлт">
            {business.delivery.map((d) => (
              <button
                key={d.id}
                type="button"
                role="radio"
                aria-checked={delivery === d.id}
                onClick={() => setDelivery(d.id)}
                className="rounded-xl p-3.5 text-left ring-1 ring-line transition hover:ring-ink aria-checked:bg-[#fdecee] aria-checked:ring-2 aria-checked:ring-brick"
              >
                <span className="flex items-center justify-between gap-2 font-semibold">
                  {d.name}
                  <span className="tnum text-[13px] text-brick">{fee === 0 ? "Үнэгүй" : formatPrice(d.fee)}</span>
                </span>
                <span className="mt-1 block text-[12.5px] leading-snug text-mute">{d.note}</span>
              </button>
            ))}
          </div>
          <div className="mt-3 rounded-xl bg-plate px-4 py-3 text-[13.5px]">
            {toFree > 0 ? (
              <>
                <p>
                  Дахиад <b className="tnum">{formatPrice(toFree)}</b>-ийн бараа нэмбэл хүргэлт үнэгүй.
                </p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white" aria-hidden>
                  <div className="grad h-full rounded-full" style={{ width: `${Math.min(100, (subtotal / business.freeFrom) * 100)}%` }} />
                </div>
              </>
            ) : (
              <p className="flex items-center gap-2 font-semibold text-teal">
                <TruckIcon size={17} /> {formatPrice(business.freeFrom)}-өөс дээш тул хүргэлт үнэгүй.
              </p>
            )}
            {delivery === "countryside" && <p className="mt-2 text-ink-2">{business.rules.countryside}</p>}
          </div>
          {err("delivery")}
          <label className="mt-4 block text-sm font-semibold">
            {delivery === "countryside" ? "Аймаг, сум, унаа, хүлээн авах хүн" : "Хаяг"}
            <textarea
              name="address"
              rows={2}
              required
              aria-invalid={!!errors.address}
              placeholder={delivery === "countryside" ? "Аймаг, сум; ямар унаанд тавих (жолоочийн утас); хүлээн авах хүний утас" : "Дүүрэг, хороо, байр, орц, давхар, тоот"}
              className={field}
            />
            {err("address")}
          </label>
        </section>

        <section className={box}>
          <h2 className="display font-bold">И-баримт, тайлбар</h2>
          <div className="mt-3 flex gap-2" role="radiogroup" aria-label="И-баримтын төрөл">
            {(
              [
                ["person", "Хувь хүн"],
                ["company", "Байгууллага"],
              ] as const
            ).map(([id, label]) => (
              <button key={id} type="button" role="radio" aria-checked={receiptType === id} onClick={() => setReceiptType(id)} className="rounded-xl px-4 py-2 text-sm font-semibold ring-1 ring-line aria-checked:bg-ink aria-checked:text-white aria-checked:ring-ink">
                {label}
              </button>
            ))}
          </div>
          {receiptType === "company" ? (
            <label className="mt-3 block text-sm font-semibold">
              Байгууллагын регистр
              <input name="regNo" inputMode="numeric" maxLength={7} placeholder="1234567" aria-invalid={!!errors.regNo} className={field} />
              {err("regNo")}
            </label>
          ) : (
            <p className="mt-2 text-[13px] text-mute">И-баримтыг таны утасны дугаараар бүртгэнэ.</p>
          )}
          <label className="mt-4 block text-sm font-semibold">
            Нэмэлт тайлбар <span className="font-normal text-mute">(заавал биш)</span>
            <textarea name="note" rows={2} className={field} />
          </label>
        </section>
      </div>

      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="studs-dark overflow-hidden rounded-2xl text-white">
          <div className="grad h-1.5" aria-hidden />
          <div className="p-6">
            <h2 className="display text-2xl font-bold">Төлөх дүн</h2>
            <dl className="tnum mt-4 space-y-2 text-[15px]">
              <div className="flex justify-between">
                <dt className="text-white/65">Барааны дүн</dt>
                <dd>{formatPrice(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-white/65">Хүргэлт</dt>
                <dd>{fee ? formatPrice(fee) : "Үнэгүй"}</dd>
              </div>
              <div className="flex justify-between border-t border-white/15 pt-3 text-xl font-bold">
                <dt>Нийт</dt>
                <dd className="display text-amber">{formatPrice(total)}</dd>
              </div>
            </dl>
            <div className="mt-5 flex items-center gap-3 rounded-xl bg-white/8 p-3">
              <span className="rounded-md bg-[#e6332a] px-2 py-1 text-xs font-black text-white">QPay</span>
              <span className="text-[13px] leading-snug text-white/80">{business.rules.payment}</span>
            </div>
            <label className="mt-3 flex cursor-pointer gap-3 rounded-xl bg-white/8 p-3 text-[13px] leading-snug text-white/80">
              <input type="checkbox" checked={installment} onChange={(e) => setInstallment(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-amber" />
              <span>
                <b className="text-white">6 хуваан төлөх хүсэлт</b> (SocialPay, ArdPay). Манайх утсаар холбогдож нөхцөлийг тохирно.
              </span>
            </label>
            {notice && (
              <p role="alert" className="mt-4 rounded-xl bg-amber px-3.5 py-3 text-[13.5px] font-medium text-ink">
                {notice}
              </p>
            )}
            {errors.items && <p className="mt-3 text-[13.5px] font-semibold text-amber">{errors.items}</p>}
            <button type="submit" disabled={busy} className="brick mt-5 h-13 w-full rounded-xl bg-brick font-semibold text-white disabled:cursor-wait disabled:opacity-60">
              {busy ? "Илгээж байна…" : "Захиалга өгөх"}
            </button>
            <a href={`tel:${business.phone.tel}`} className="mt-4 flex items-center gap-2 text-[13.5px] font-semibold text-white/75 hover:text-amber">
              <PhoneIcon size={16} /> Асуух зүйл байвал: {business.phone.display}
            </a>
          </div>
        </div>
      </aside>
    </form>
  );
}

function Receipt({ done }: { done: Done }) {
  return (
    <div className="mx-auto max-w-lg">
      <div className="rise rounded-2xl bg-card p-7 shadow-lg ring-1 ring-line">
        <span className="grid h-14 w-14 place-items-center rounded-xl bg-teal text-white">
          <CheckIcon size={28} />
        </span>
        <h2 className="display mt-4 text-3xl font-bold">Захиалга хүлээн авлаа</h2>
        <p className="mt-1 text-ink-2">
          Захиалгын код: <b className="tnum text-ink">{done.reference}</b>
        </p>
        <ul className="tnum mt-5 space-y-2 text-[14.5px]">
          {done.lines.map((l) => (
            <li key={l.name} className="flex justify-between gap-4">
              <span className="text-ink-2">
                {l.name} × {l.qty}
              </span>
              <span>{formatPrice(l.total)}</span>
            </li>
          ))}
          <li className="flex justify-between gap-4">
            <span className="text-ink-2">Хүргэлт</span>
            <span>{done.deliveryFee ? formatPrice(done.deliveryFee) : "Үнэгүй"}</span>
          </li>
          <li className="flex justify-between gap-4 border-t border-line pt-2 text-lg font-bold">
            <span>Нийт</span>
            <span>{formatPrice(done.total)}</span>
          </li>
        </ul>
        <p className="mt-5 text-[14px] leading-relaxed text-ink-2">QPay нэхэмжлэлийг таны утсанд илгээнэ. Төлбөр төлөгдсөнөөр захиалга баталгаажна. {business.rules.ebarimt}</p>
        <Link href="/shop" className="brick mt-6 inline-block rounded-xl bg-brick px-6 py-3 font-semibold text-white">
          Үргэлжлүүлэн үзэх
        </Link>
      </div>
    </div>
  );
}
