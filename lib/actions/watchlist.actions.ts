'use server';

import { connecToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

// ───────────────────────────  helpers  ───────────────────────────

async function getCurrentUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.email) throw new Error('Unauthenticated');

  await connecToDatabase();

  const mongoose = await connecToDatabase();
  const db = mongoose.connection.db;
  if (!db) throw new Error('MongoDB connection not found');

  const user = await db
    .collection('user')
    .findOne<{ _id?: unknown; id?: string; email?: string }>({ email: session.user.email });

  if (!user) throw new Error('User not found');
  return (user.id as string) || String(user._id || '');
}

// ─────────────────────  public actions  ──────────────────────────

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const mongoose = await connecToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    const user = await db
      .collection('user')
      .findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail error:', err);
    return [];
  }
}

export async function getWatchlistItems(): Promise<
  { symbol: string; company: string; addedAt: Date }[]
> {
  try {
    const userId = await getCurrentUserId();
    const items = await Watchlist.find({ userId }).lean();
    return items.map((i) => ({
      symbol: String(i.symbol),
      company: String(i.company),
      addedAt: i.addedAt,
    }));
  } catch (err) {
    console.error('getWatchlistItems error:', err);
    return [];
  }
}

export async function toggleWatchlist(
  symbol: string,
  company: string
): Promise<{ isInWatchlist: boolean }> {
  try {
    const userId = await getCurrentUserId();
    const upperSymbol = symbol.toUpperCase();

    const existing = await Watchlist.findOne({ userId, symbol: upperSymbol });

    if (existing) {
      await Watchlist.deleteOne({ userId, symbol: upperSymbol });
      revalidatePath('/watchlist');
      revalidatePath(`/stocks/${symbol.toLowerCase()}`);
      return { isInWatchlist: false };
    } else {
      await Watchlist.create({ userId, symbol: upperSymbol, company });
      revalidatePath('/watchlist');
      revalidatePath(`/stocks/${symbol.toLowerCase()}`);
      return { isInWatchlist: true };
    }
  } catch (err) {
    console.error('toggleWatchlist error:', err);
    throw new Error('Failed to update watchlist');
  }
}