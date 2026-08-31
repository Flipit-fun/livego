import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { isAddress } from "viem";
import { verifyOwnership } from "@/lib/auth";
import { devFor, devOverride } from "@/lib/data";
import { getCreator } from "@/lib/robinhood";

// LiveKit server SDK needs the Node.js runtime (not edge).
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface TokenRequest {
  room?: string;
  address?: string;
  /** The challenge message that was signed (from /api/auth/challenge). */
  message?: string;
  /** personal_sign signature over `message`. */
  signature?: `0x${string}`;
  /** Set when connecting without an injected wallet (demo mode). */
  demo?: boolean;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

  if (!apiKey || !apiSecret || !wsUrl) {
    return NextResponse.json(
      {
        error:
          "LiveKit is not configured. Set LIVEKIT_API_KEY, LIVEKIT_API_SECRET and NEXT_PUBLIC_LIVEKIT_URL.",
      },
      { status: 500 }
    );
  }

  let body: TokenRequest;
  try {
    body = (await req.json()) as TokenRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const room = body.room?.trim();
  const address = body.address?.trim();
  if (!room || !address || !isAddress(address)) {
    return NextResponse.json(
      { error: "`room` and a valid `address` are required." },
      { status: 400 }
    );
  }

  // Demo mode: no injected wallet, so ownership can't be proven. Allowed unless
  // explicitly disabled for production.
  const allowDemo = process.env.LIVEKIT_ALLOW_DEMO !== "false";
  if (body.demo) {
    if (!allowDemo) {
      return NextResponse.json(
        { error: "Wallet signature required." },
        { status: 401 }
      );
    }
  } else {
    const verified = await verifyOwnership(address, body.message, body.signature);
    if (!verified.ok) {
      return NextResponse.json(
        { error: verified.reason ?? "Wallet ownership could not be verified." },
        { status: 401 }
      );
    }
  }

  const identity = address.toLowerCase();

  // Rooms are keyed by contract address for real coins (unique on-chain), and
  // by ticker for demo coins. Resolve the coin's dev accordingly.
  const roomIsContract = isAddress(room);
  const roomName = roomIsContract ? room.toLowerCase() : room;
  const dev = roomIsContract
    ? devOverride(room) ?? (await getCreator(room))
    : devFor(room, identity);

  // Least-privilege: only the coin's dev/creator (deployer) may publish (host).
  // Everyone else is subscribe-only, and can be promoted to the stage later.
  const canPublish = !!dev && dev.toLowerCase() === identity;

  const at = new AccessToken(apiKey, apiSecret, {
    identity,
    name: identity,
    ttl: "2h",
  });

  at.addGrant({
    room: roomName,
    roomJoin: true,
    canSubscribe: true,
    canPublish,
    canPublishData: true,
  });

  const token = await at.toJwt();

  return NextResponse.json({ token, url: wsUrl, canPublish });
}
