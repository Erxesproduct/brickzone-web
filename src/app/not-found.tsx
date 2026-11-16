import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <span className="mx-auto flex w-fit gap-1.5" aria-hidden>
        <span className="h-5 w-10 rounded-t-md bg-brick" />
        <span className="h-5 w-10 rounded-t-md bg-amber" />
        <span className="h-5 w-10 rounded-t-md bg-teal opacity-30" />
      </span>
      <h1 className="display mt-6 text-4xl font-bold">Хуудас олдсонгүй</h1>
      <p className="mt-3 text-ink-2">Нэг хэсэг нь дутуу байна: холбоос хуучирсан эсвэл бараа жагсаалтаас хасагдсан байж магадгүй.</p>
      <Link href="/shop" className="brick mt-8 inline-block rounded-xl bg-brick px-6 py-3 font-semibold text-white">
        Дэлгүүр үзэх
      </Link>
    </div>
  );
}
