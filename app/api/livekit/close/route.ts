import { NextRequest, NextResponse } from "next/server";
import { isAddress } from "viem";
import { verifyOwnership } from "@/lib/auth";
import { devFor, devOverride } from "@/lib/data";
import { getCreator } from "@/lib/robinhood";
import { deleteRoom } from "@/lib/livekitServer";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface CloseRequest {
  room?: string;
  address?: string;
  message?: string;
  signature?: `0x${string}`;
}

// Ends a room for everyone. Only the coin's dev (the host) may do this.
export async function POST(req: NextRequest) {
  let body: CloseRequest;
  try {
    body = (await req.json()) as CloseRequest;
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

  const verified = await verifyOwnership(address, body.message, body.signature);
  if (!verified.ok) {
    return NextResponse.json(
      { error: verified.reason ?? "Ownership could not be verified." },
      { status: 401 }
    );
  }

  const identity = address.toLowerCase();
  const roomIsContract = isAddress(room);
  const roomName = roomIsContract ? room.toLowerCase() : room;
  const dev = roomIsContract
    ? devOverride(room) ?? (await getCreator(room))
    : devFor(room, identity);

  if (!dev || dev.toLowerCase() !== identity) {
    return NextResponse.json(
      { error: "Only the coin's dev can close this room." },
      { status: 403 }
    );
  }

  await deleteRoom(roomName);
  return NextResponse.json({ ok: true });
}
