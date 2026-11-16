import { Geologica, Tektur } from "next/font/google";

// Both carry Mongolian Ө ө Ү ү (cyrillic-ext).
export const tektur = Tektur({ subsets: ["latin", "cyrillic", "cyrillic-ext"], variable: "--font-tektur", display: "swap" });
export const geologica = Geologica({ subsets: ["latin", "cyrillic", "cyrillic-ext"], variable: "--font-geologica", display: "swap" });
