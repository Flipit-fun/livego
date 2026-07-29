"use client";

import { useWallet, shortenAddress } from "@/components/WalletContext";
import type { Coin } from "@/lib/data";

export interface RoomCard {
  t: string;
  n: string;
  title: string;
  host: string;
  v: number;
  live: boolean;
  mine: boolean;
  address?: string;
  dev?: string;
}

export function coinToRoom(c: Coin, mine = true): RoomCard {
  return {
    t: c.t,
    n: c.n,
    title: c.title || `${c.t} room`,
    host: c.dev ? shortenAddress(c.dev) : "-",
    v: c.v,
    live: c.live,
    mine,
    address: c.address,
    dev: c.dev,
  };
}

export interface DisplayRooms {
  held: RoomCard[];
  stats: { live: number; watching: number; tokens: number };
}

/** Real holdings only - no mock or directory data. */
export function useDisplayRooms(): DisplayRooms {
  const { coins } = useWallet();
  const held = coins.map((c) => coinToRoom(c));
  const live = held.filter((r) => r.live);

  return {
    held,
    stats: {
      live: live.length,
      watching: live.reduce((a, b) => a + b.v, 0),
      tokens: held.length,
    },
  };
}
