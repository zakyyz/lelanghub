import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { Gavel } from "lucide-react";
import { Inter } from "next/font/google";
import "./globals.css";
import { SearchBar } from "@/components/SearchBar";
import { Providers } from "@/app/providers";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LelangHub — Agregator Lelang Indonesia",
    template: "%s | LelangHub",
  },
  description:
    "Temukan barang lelang dengan diskon terbaik dari DJKN, KOELAK, dan IBID. Filter per tier diskon, kategori, lokasi, dan harga — dari SUPER DEAL sampai SKIP.",
  keywords: [
    "lelang",
    "lelang indonesia",
    "DJKN",
    "IBID",
    "KOELAK",
    "agregator lelang",
    "barang lelang murah",
  ],
  icons: {
    icon: "/lelanghub-icon.svg",
  },
  openGraph: {
    title: "LelangHub — Agregator Lelang Indonesia",
    description:
      "Kumpulan lot lelang DJKN, KOELAK, dan IBID dengan sistem tier diskon S sampai D.",
    siteName: "LelangHub",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${inter.variable} min-h-screen bg-slate-950 font-sans text-slate-100 antialiased`}
      >
        <div className="flex min-h-screen flex-col">
          <Providers>
          <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur supports-[backdrop-filter]:bg-slate-950/75">
            <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6">
              <Link
                href="/"
                className="flex shrink-0 items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 rounded-md"
                aria-label="LelangHub — ke beranda"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/30">
                  <Gavel className="h-5 w-5" aria-hidden />
                </span>
                <span className="text-lg font-bold tracking-tight text-slate-50">
                  Lelang<span className="text-amber-400">Hub</span>
                </span>
              </Link>
              <div className="flex flex-1 justify-end sm:justify-center">
                <div className="w-full max-w-md">
                  <Suspense fallback={null}>
                    <SearchBar />
                  </Suspense>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="mt-auto border-t border-slate-800 bg-slate-950 pb-[env(safe-area-inset-bottom)]">
            <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-2 px-4 py-6 text-center sm:px-6">
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-300">
                <Gavel className="h-4 w-4 text-amber-400" aria-hidden />
                <span>
                  Lelang<span className="text-amber-400">Hub</span>
                </span>
              </div>
              <p className="max-w-2xl text-xs leading-relaxed text-slate-500">
                Agregator informasi lot lelang dari DJKN, KOELAK, dan IBID dengan
                sistem tier diskon. LelangHub bukan penyelenggara lelang — selalu
                verifikasi detail lot di sumber asli sebelum mengikuti lelang.
              </p>
            </div>
          </footer>
          </Providers>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
