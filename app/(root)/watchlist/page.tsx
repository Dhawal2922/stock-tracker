import React from "react";
import Link from "next/link";
import { auth } from "@/lib/better-auth/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getWatchlistItems } from "@/lib/actions/watchlist.actions";
import WatchlistClientPage from "@/components/WatchlistClientPage";

export const metadata = {
  title: "My Watchlist | StockTracker",
  description: "View and manage all the stocks you have added to your watchlist.",
};

export default async function WatchlistPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/sign-in");

  const items = await getWatchlistItems();

  return <WatchlistClientPage initialItems={items} />;
}
