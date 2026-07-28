import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { coins as demoCoins, devFor, devOverride, type Coin } from "@/lib/data";
import { getHoldings, getCreators } from "@/lib/robinhood";
import { getLiveStatus } from "@/lib/livekitServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Demo fallback (ticker-keyed) when the explorer can't be reached. */
function demoFallback(address: string): Coin[] {
  return demoCoins.map((c) => ({
    t: c.t,
    n: c.n,
    b: c.b,
    usd: c.usd,
    live: false,
    v: 0,
    dev: devFor(c.t, address) ?? undefined,
  }));
}

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address")?.trim();
  if (!address || !isAddress(address)) {
    return NextResponse.json(
      { error: "A valid `address` query param is required." },
      { status: 400 }
    );
  }

  let holdings: Coin[];
  try {
    holdings = await getHoldings(address);
  } catch {
    // Explorer unavailable — fall back to demo holdings.
    return NextResponse.json({ coins: demoFallback(address) });
  }

  // Real coins are keyed by contract address. Resolve each coin's dev (the
  // contract deployer) and its live status from LiveKit in parallel.
  const contracts = holdings.map((c) => c.address!).filter(Boolean);
  const [creators, status] = await Promise.all([
    getCreators(contracts),
    getLiveStatus(contracts.map((a) => a.toLowerCase())),
  ]);

  const coins: Coin[] = holdings.map((c) => {
    const key = c.address!.toLowerCase();
    const s = status.get(key);
    return {
      ...c,
      dev: devOverride(key) ?? creators.get(key) ?? undefined,
      live: s?.live ?? false,
      v: s?.viewers ?? 0,
    };
  });

  return NextResponse.json({ coins });
}
