import { TOKEN_REGISTRY } from "./chain";

export interface Coin {
  t: string;
  n: string;
  b: string;
  usd: string;
  live: boolean;
  v: number;
  /** Creator/dev address — the only account allowed to host this coin's room. */
  dev?: string;
  /** ERC-20 contract address; the unique room key for real (on-chain) coins. */
  address?: string;
  /** Optional room title for display in the directory. */
  title?: string;
}

interface DemoCoin extends Coin {
  /** In demo data, marks a coin as "created by the connecting wallet" so the
   * connected user becomes its dev and can go live. */
  mine?: boolean;
}

export const coins: DemoCoin[] = [
  { t: "HOOD", n: "RobinHood", b: "128,400.22", usd: "$41,208", live: true, v: 1284, title: "Chain roadmap, unfiltered", mine: true },
  { t: "USDG", n: "Gold Dollar", b: "12,050.00", usd: "$12,050", live: false, v: 0, title: "Reserve attestation Q&A", dev: "0x1111111111111111111111111111111111111111" },
  { t: "PERP", n: "Perp Index", b: "8,430.51", usd: "$6,102", live: true, v: 412, title: "Funding rate teardown", mine: true },
  { t: "RWAX", n: "RWA Basket", b: "2,900.00", usd: "$9,860", live: true, v: 337, title: "Basket rebalance call", dev: "0x2222222222222222222222222222222222222222" },
  { t: "STAKD", n: "Staked Hood", b: "640.77", usd: "$3,140", live: false, v: 0, title: "Vault mechanics walkthrough", dev: "0x3333333333333333333333333333333333333333" },
  { t: "LEND", n: "Lendora", b: "55,210.00", usd: "$2,004", live: true, v: 98, title: "Borrowing against RWAs", dev: "0x4444444444444444444444444444444444444444" },
];



/** Optional server-side override mapping a coin -> dev address, from the
 * DEV_OVERRIDES env var. Keys may be a ticker OR a contract address, e.g.
 * "HOOD:0xabc...,0xcontract...:0xdef...". Handy for testing host/join without
 * deploying a token. Keys are matched case-insensitively. */
function devOverrides(): Record<string, string> {
  const raw = process.env.DEV_OVERRIDES;
  if (!raw) return {};
  const map: Record<string, string> = {};
  for (const pair of raw.split(",")) {
    const [k, addr] = pair.split(":");
    if (k && addr) map[k.trim().toLowerCase()] = addr.trim().toLowerCase();
  }
  return map;
}

/** Look up a dev override by ticker or contract address (case-insensitive). */
export function devOverride(key: string): string | null {
  return devOverrides()[key.trim().toLowerCase()] ?? null;
}

/**
 * Resolve the dev/creator address for a coin. Priority:
 *   1. DEV_OVERRIDES env
 *   2. on-chain token registry
 *   3. demo data — a "mine" coin is owned by the requesting wallet
 * Returns a lowercased address or null.
 */
export function devFor(ticker: string, requester?: string): string | null {
  const t = ticker.toUpperCase();

  const override = devOverride(t);
  if (override) return override;

  const reg = TOKEN_REGISTRY.find((r) => r.symbol.toUpperCase() === t);
  if (reg?.dev) return reg.dev.toLowerCase();

  const demo = coins.find((c) => c.t === t);
  if (!demo) return null;
  if (demo.mine && requester) return requester.toLowerCase();
  return demo.dev ? demo.dev.toLowerCase() : null;
}

export type ChatMessage = [who: string, text: string];

export const chats: Record<string, ChatMessage[]> = {
  HOOD: [
    ["0x91a…4d", "chart on screen please"],
    ["0x7db…0c", "how long is the call"],
    ["0xc40…f2", "bring up the dev"],
    ["0x2ba…91", "holding since launch"],
    ["0x5ff…3a", "can i get on stage"],
    ["0x88c…7e", "audio is clean"],
    ["0x0de…12", "what is the unlock date"],
    ["0x61b…aa", "this room is packed"],
  ],
  USDG: [
    ["0x33a…9b", "pegged and boring, love it"],
    ["0x7cc…21", "reserves update when"],
    ["0x19f…50", "share the attestation"],
  ],
  PERP: [
    ["0x4aa…77", "funding just flipped"],
    ["0x90d…03", "open interest chart"],
    ["0x12e…8f", "size that long"],
    ["0x66b…4c", "stage invite please"],
  ],
  RWAX: [
    ["0x71c…39", "which properties are in it"],
    ["0x2fd…60", "rent distribution date"],
    ["0x83a…15", "show the basket weights"],
  ],
  STAKD: [
    ["0x5cd…82", "apr right now"],
    ["0x40e…11", "unstake window"],
    ["0x9ab…73", "screen share the vault"],
  ],
  LEND: [
    ["0x28f…64", "ltv on hood collateral"],
    ["0x77a…09", "liquidation levels"],
    ["0x3bc…55", "walk through a borrow"],
  ],
};


