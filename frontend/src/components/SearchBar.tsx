"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Search bar di header. Submit -> navigasi ke homepage dengan ?search=...
 * sehingga link-nya shareable. Prefill dari URL bila sedang memfilter search.
 */
export function SearchBar({ className }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Prefill + sinkron dengan kata kunci di URL (mis. user datang dari link share)
  // memakai pola "adjust state during render".
  const urlSearch = searchParams.get("search") ?? "";
  const [value, setValue] = useState(urlSearch);
  const [lastUrlSearch, setLastUrlSearch] = useState(urlSearch);

  if (lastUrlSearch !== urlSearch) {
    setLastUrlSearch(urlSearch);
    setValue(urlSearch);
  }

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const q = value.trim();
    router.push(q ? `/?search=${encodeURIComponent(q)}` : "/");
  };

  return (
    <form
      onSubmit={handleSubmit}
      role="search"
      aria-label="Cari lot lelang"
      className={cn("flex w-full items-center gap-2", className)}
    >
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500"
          aria-hidden
        />
        <Input
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Cari laptop, mobil, tanah..."
          aria-label="Kata kunci pencarian"
          className="h-10 border-slate-800 bg-slate-900 pl-9 text-sm text-slate-100 placeholder:text-slate-500 focus-visible:border-amber-400/60 focus-visible:ring-amber-400/30 [&::-webkit-search-cancel-button]:hidden"
        />
      </div>
      <Button
        type="submit"
        size="sm"
        className="h-10 shrink-0 bg-amber-400 px-4 font-semibold text-slate-950 hover:bg-amber-300"
      >
        Cari
      </Button>
    </form>
  );
}
