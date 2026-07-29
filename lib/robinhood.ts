import { formatUnits } from "viem";
import type { Coin } from "./data";

// On-chain data for RobinHood Chain via its Blockscout explorer API. This is
// what makes Livego work for ANY coin on the chain: holdings and the coin's
// dev (contract deployer) are read live, with no hardcoded token list.

function explorerBase(): string {
  const url =
    process.env.NEXT_PUBLIC_CHAIN_EXPLORER_URL || "https://robinhoodchain.blockscout.com";
  return url.replace(/\/$/, "") + "/api/v2";
}

interface RawTokenBalance {
  token: {
    address_hash?: string;
    address?: string;
    symbol: string | null;
    name: string | null;
    decimals: string | null;
    type: string;
    exchange_rate: string | null;
  };
  value: string;
}

function formatBalance(raw: string, decimals: number): string {
  const n = Number(formatUnits(BigInt(raw), decimals));
  return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function formatUsd(raw: string, decimals: number, rate: string | null): string {
  if (!rate) return "—";
  const n = Number(formatUnits(BigInt(raw), decimals)) * Number(rate);
  if (!Number.isFinite(n)) return "—";
  return "$" + n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/** Every ERC-20 the wallet holds, as rooms keyed by contract address. */
export async function getHoldings(address: string): Promise<Coin[]> {
  const res = await fetch(
    `${explorerBase()}/addresses/${address}/token-balances`,
    { headers: { accept: "application/json" }, cache: "no-store" }
  );
  if (!res.ok) throw new Error(`explorer ${res.status}`);
  const data = (await res.json()) as RawTokenBalance[];

  return data
    .filter((b) => b.token.type === "ERC-20" && b.value && b.value !== "0")
    .map((b) => {
      const contract = (b.token.address_hash || b.token.address || "").toLowerCase();
      const decimals = Number(b.token.decimals ?? "18") || 18;
      return {
        t: b.token.symbol || "TOKEN",
        n: b.token.name || b.token.symbol || "Token",
        b: formatBalance(b.value, decimals),
        usd: formatUsd(b.value, decimals, b.token.exchange_rate),
        live: false,
        v: 0,
        address: contract,
      } satisfies Coin;
    })
    .filter((c) => c.address);
}

export interface TokenInfo {
  symbol: string;
  name: string;
  decimals: number;
}

/** Look up a token's metadata by contract address (for the CA search). */
export async function getTokenInfo(contract: string): Promise<TokenInfo | null> {
  try {
    const res = await fetch(`${explorerBase()}/tokens/${contract}`, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const d = (await res.json()) as {
      symbol?: string | null;
      name?: string | null;
      decimals?: string | null;
    };
    if (!d.symbol && !d.name) return null;
    return {
      symbol: d.symbol || "TOKEN",
      name: d.name || d.symbol || "Token",
      decimals: Number(d.decimals ?? "18") || 18,
    };
  } catch {
    return null;
  }
}

// Contract creators never change, so cache them process-wide. Also dedupe
// concurrent lookups for the same address.
const creatorCache = new Map<string, string | null>();
const inflight = new Map<string, Promise<string | null>>();

/**
 * Resolve a token's dev. `creator_address_hash` is the deployer, but for
 * launchpad tokens that's the factory contract (e.g. a LaunchFactory) — not a
 * person. The reliable human signal is the EOA that sent the creation
 * transaction (the account that called the factory / did the deploy), which is
 * correct for both direct deploys and launchpad deploys. Fall back to
 * `creator_address_hash` only if the tx lookup fails.
 */
async function fetchCreator(contract: string): Promise<string | null> {
  try {
    const res = await fetch(`${explorerBase()}/addresses/${contract}`, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      creator_address_hash?: string | null;
      creation_transaction_hash?: string | null;
      creation_tx_hash?: string | null;
    };

    const txHash = data.creation_transaction_hash || data.creation_tx_hash;
    if (txHash) {
      const from = await creationTxFrom(txHash);
      if (from) return from;
    }
    return data.creator_address_hash?.toLowerCase() ?? null;
  } catch {
    return null;
  }
}

async function creationTxFrom(txHash: string): Promise<string | null> {
  try {
    const res = await fetch(`${explorerBase()}/transactions/${txHash}`, {
      headers: { accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const tx = (await res.json()) as { from?: { hash?: string } | null };
    return tx.from?.hash ? tx.from.hash.toLowerCase() : null;
  } catch {
    return null;
  }
}

/** The deployer of a token contract — treated as the coin's dev. Cached. */
export async function getCreator(contract: string): Promise<string | null> {
  const key = contract.toLowerCase();
  if (creatorCache.has(key)) return creatorCache.get(key) ?? null;
  if (inflight.has(key)) return inflight.get(key)!;

  const p = fetchCreator(key).then((creator) => {
    creatorCache.set(key, creator);
    inflight.delete(key);
    return creator;
  });
  inflight.set(key, p);
  return p;
}

/** Resolve creators for many contracts with a small concurrency cap. */
export async function getCreators(
  contracts: string[]
): Promise<Map<string, string | null>> {
  const out = new Map<string, string | null>();
  const queue = [...contracts];
  const workers = Array.from({ length: Math.min(8, queue.length) }, async () => {
    while (queue.length) {
      const c = queue.shift()!;
      out.set(c.toLowerCase(), await getCreator(c));
    }
  });
  await Promise.all(workers);
  return out;
}
