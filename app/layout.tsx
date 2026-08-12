import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scrolling King — 登り続けろ",
  description: "王様を操作して空高く登る、縦スクロール・アーケードゲーム。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ja"><body>{children}</body></html>;
}
