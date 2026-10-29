import { Fraunces, Inter } from "next/font/google";

export const inter = Inter({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-inter",
});

export const fraunces = Fraunces({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  axes: ["opsz"],
  variable: "--font-fraunces",
});
