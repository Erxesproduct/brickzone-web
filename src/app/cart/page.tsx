import type { Metadata } from "next";
import { Checkout } from "@/components/checkout";

export const metadata: Metadata = { title: "Сагс", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
      <h1 className="display text-[34px] font-bold sm:text-[44px]">Сагс, захиалга</h1>
      <div className="mt-8">
        <Checkout />
      </div>
    </div>
  );
}
