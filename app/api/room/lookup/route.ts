import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { devOverride } from "@/lib/data";
import { getTokenInfo, getCreator } from "@/lib/robinhood";
import { getLiveStatus } from "@/lib/livekitServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Find a token's room by contract address so anyone can join it, held or not.
export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address")?.trim();
  if (!address || !isAddress(address)) {
    return NextResponse.json(
      { error: "Enter a valid contract address (0x…)." },
      { status: 400 }
    );
  }

  const info = await getTokenInfo(address);
  if (!info) {
    return NextResponse.json(
      { error: "No token found at that address on RobinHood Chain." },
      { status: 404 }
    );
  }

  const key = address.toLowerCase();
  const [status, dev] = await Promise.all([
    getLiveStatus([key]),
    Promise.resolve(devOverride(key)).then((o) => o ?? getCreator(key)),
  ]);
  const s = status.get(key);

  return NextResponse.json({
    room: {
      t: info.symbol,
      n: info.name,
      address: key,
      live: s?.live ?? false,
      v: s?.viewers ?? 0,
      dev: dev ?? undefined,
    },
  });
}
