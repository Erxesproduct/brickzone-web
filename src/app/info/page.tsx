import type { Metadata } from "next";
import { CardIcon, ClockIcon, MailIcon, PhoneIcon, PinIcon, ReceiptIcon, TruckIcon } from "@/components/icons";
import { business } from "@/content/business";
import { about, faq } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: "Хүргэлт, төлбөр, холбоо барих",
  description: `Хүргэлт ${formatPrice(business.delivery[0].fee)}, ${formatPrice(business.freeFrom)}-өөс дээш үнэгүй. QPay, SocialPay/ArdPay 6 хуваан. ${business.address}.`,
  alternates: { canonical: "/info" },
};

export default function Info() {
  const card = "rounded-3xl bg-card p-6 ring-1 ring-line sm:p-8";
  return (
    <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6">
      <p className="label text-mute">Мэдээлэл</p>
      <h1 className="display mt-1.5 text-[34px] font-bold sm:text-[44px]">Хүргэлт, төлбөр, холбоо барих</h1>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <section id="delivery" className={`${card} scroll-mt-28`}>
          <TruckIcon size={26} className="text-brick" />
          <h2 className="display mt-3 text-xl font-bold">Хүргэлт</h2>
          <ul className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-ink-2">
            {business.delivery.map((d) => (
              <li key={d.id}>
                <b className="text-ink">{d.name}:</b> {formatPrice(d.fee)}. {d.note}.
              </li>
            ))}
            <li className="font-semibold text-teal">{formatPrice(business.freeFrom)}-өөс дээш захиалгад хүргэлт үнэгүй.</li>
            <li>{business.rules.delivery}</li>
            <li>{business.rules.countryside}</li>
          </ul>
        </section>

        <section id="payment" className={`${card} scroll-mt-28`}>
          <CardIcon size={26} className="text-teal" />
          <h2 className="display mt-3 text-xl font-bold">Төлбөр</h2>
          <ul className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-ink-2">
            <li>{business.rules.payment}</li>
            <li>{business.rules.installment}</li>
          </ul>
          <div className="mt-5 flex gap-3 border-t border-line pt-5 text-[15px] leading-relaxed text-ink-2">
            <ReceiptIcon size={22} className="mt-0.5 shrink-0 text-ink" />
            <span>{business.rules.ebarimt}</span>
          </div>
        </section>
      </div>

      <section id="faq" className={`${card} mt-5 scroll-mt-28`}>
        <h2 className="display text-xl font-bold">Түгээмэл асуулт</h2>
        <dl className="mt-4 divide-y divide-line">
          {faq.map((f) => (
            <div key={f.q} className="grid gap-1 py-3.5 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] sm:gap-6">
              <dt className="font-semibold">{f.q}</dt>
              <dd className="text-ink-2">{f.a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <section id="about" className="relative scroll-mt-28 overflow-hidden rounded-3xl bg-teal p-6 text-white sm:p-8">
          <div className="stud-row absolute inset-x-6 top-0 [--stud:rgb(255_255_255/0.22)]" aria-hidden />
          <h2 className="display text-xl font-bold">Бидний тухай</h2>
          <div className="mt-3 space-y-2.5 text-[15px] leading-relaxed text-white/90">
            {about
              .filter((l) => !/^Бидний тухай/.test(l))
              .map((l) => (
                <p key={l} className={/^Бидний зорилго/.test(l) ? "pt-2 font-semibold text-white" : ""}>
                  {l.replace(/^🔹\s*/, "▸ ").replace(/\s*—\s*$/, "")}
                </p>
              ))}
          </div>
        </section>

        <section id="contact" className={`${card} scroll-mt-28`}>
          <h2 className="display text-xl font-bold">Дэлгүүр</h2>
          <ul className="mt-4 space-y-3.5 text-[15px]">
            <li>
              <a href={business.mapUrl} target="_blank" rel="noopener noreferrer" className="flex gap-2.5 hover:text-brick">
                <PinIcon size={18} className="mt-0.5 shrink-0 text-brick" /> {business.address}
              </a>
            </li>
            <li className="flex items-center gap-2.5">
              <ClockIcon size={18} className="shrink-0 text-brick" /> {business.hours}
            </li>
            <li>
              <a href={`tel:${business.phone.tel}`} className="flex items-center gap-2.5 font-semibold hover:text-brick">
                <PhoneIcon size={18} className="shrink-0 text-brick" /> <span className="tnum">{business.phone.display}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${business.email}`} className="flex items-center gap-2.5 break-all hover:text-brick">
                <MailIcon size={18} className="shrink-0 text-brick" /> {business.email}
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}
