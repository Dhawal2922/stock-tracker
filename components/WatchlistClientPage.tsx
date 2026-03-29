"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { toggleWatchlist } from "@/lib/actions/watchlist.actions";

type WatchlistItem = {
  symbol: string;
  company: string;
  addedAt: Date;
};

interface Props {
  initialItems: WatchlistItem[];
}

export default function WatchlistClientPage({ initialItems }: Props) {
  const [items, setItems] = useState<WatchlistItem[]>(initialItems);
  const [removingSymbol, setRemovingSymbol] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleRemove = (symbol: string, company: string) => {
    // Optimistic remove
    setRemovingSymbol(symbol);
    setItems((prev) => prev.filter((i) => i.symbol !== symbol));

    startTransition(async () => {
      try {
        await toggleWatchlist(symbol, company);
      } catch {
        // rollback
        setItems(initialItems);
      } finally {
        setRemovingSymbol(null);
      }
    });
  };

  const isEmpty = items.length === 0;

  return (
    <div className="min-h-screen">
      {/* Page Header */}
      <div className="mb-8 md:mb-10">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-1 h-8 bg-yellow-500 rounded-full" />
          <h1 className="watchlist-title text-3xl md:text-4xl">My Watchlist</h1>
        </div>
        <p className="text-gray-500 ml-4 text-sm md:text-base">
          {isEmpty
            ? "You have not added any stocks yet."
            : `Tracking ${items.length} stock${items.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {isEmpty ? (
        /* ─── Empty State ─── */
        <div className="flex flex-col items-center justify-center py-24 gap-6 text-center">
          <div className="relative">
            {/* Glow ring */}
            <div className="absolute inset-0 rounded-full bg-yellow-500/10 blur-2xl scale-150" />
            <div className="relative z-10 w-24 h-24 rounded-full bg-gray-800 border border-gray-600 flex items-center justify-center shadow-xl">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#FACC15"
                strokeWidth="1.5"
                className="w-12 h-12"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
                />
              </svg>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-100 mb-2">Your watchlist is empty</h2>
            <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
              Search for stocks and click <span className="text-yellow-400 font-medium">"Add to Watchlist"</span> to start tracking them here.
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-yellow-500/25"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            Explore Markets
          </Link>
        </div>
      ) : (
        /* ─── Watchlist Grid ─── */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {items.map((item) => (
            <WatchlistCard
              key={item.symbol}
              item={item}
              isRemoving={removingSymbol === item.symbol}
              onRemove={() => handleRemove(item.symbol, item.company)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────── Card Sub-component ───────────────────────── */

function WatchlistCard({
  item,
  isRemoving,
  onRemove,
}: {
  item: WatchlistItem;
  isRemoving: boolean;
  onRemove: () => void;
}) {
  const addedDate = new Date(item.addedAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className={`group relative bg-gray-800 border border-gray-600 rounded-xl p-5 flex flex-col gap-4 transition-all duration-300 hover:border-yellow-500/40 hover:shadow-lg hover:shadow-yellow-500/5 ${
        isRemoving ? "opacity-40 pointer-events-none scale-95" : ""
      }`}
    >
      {/* Symbol badge + remove button */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-gray-700 border border-gray-600 flex items-center justify-center font-bold text-yellow-400 text-sm tracking-wide">
            {item.symbol.slice(0, 4)}
          </div>
          <div>
            <p className="font-bold text-gray-100 text-base leading-tight">{item.symbol}</p>
            <p className="text-gray-500 text-xs mt-0.5 truncate max-w-[120px]">{item.company}</p>
          </div>
        </div>

        {/* Remove (trash) button */}
        <button
          onClick={onRemove}
          title="Remove from watchlist"
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
          </svg>
        </button>
      </div>

      {/* TradingView mini chart embed */}
      <div className="rounded-lg overflow-hidden bg-gray-900 border border-gray-700" style={{ height: 130 }}>
        <iframe
          src={`https://s.tradingview.com/embed-widget/mini-symbol-overview/?locale=en#%7B%22symbol%22%3A%22${encodeURIComponent(item.symbol)}%22%2C%22dateRange%22%3A%221M%22%2C%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Atrue%2C%22autosize%22%3Atrue%2C%22largeChartUrl%22%3A%22%22%7D`}
          style={{ width: "100%", height: "100%", border: "none" }}
          title={`${item.symbol} mini chart`}
        />
      </div>

      {/* Footer: added date + view link */}
      <div className="flex items-center justify-between mt-auto">
        <span className="text-gray-600 text-xs">Added {addedDate}</span>
        <Link
          href={`/stocks/${item.symbol.toLowerCase()}`}
          className="text-xs font-semibold text-yellow-500 hover:text-yellow-400 transition-colors flex items-center gap-1"
        >
          View
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
