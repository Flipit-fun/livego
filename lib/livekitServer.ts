import { RoomServiceClient } from "livekit-server-sdk";

export interface LiveStatus {
  live: boolean;
  viewers: number;
}

function httpUrl(): string | null {
  const url = process.env.NEXT_PUBLIC_LIVEKIT_URL;
  if (!url) return null;
  // wss:// -> https:// , ws:// -> http://
  return url.replace(/^ws/, "http");
}

function client(): RoomServiceClient | null {
  const host = httpUrl();
  const key = process.env.LIVEKIT_API_KEY;
  const secret = process.env.LIVEKIT_API_SECRET;
  if (!host || !key || !secret) return null;
  return new RoomServiceClient(host, key, secret);
}

/** Delete a room server-side, disconnecting everyone in it. Best-effort. */
export async function deleteRoom(name: string): Promise<void> {
  const svc = client();
  if (!svc) return;
  try {
    await svc.deleteRoom(name);
  } catch {
    // room may already be gone / empty - ignore
  }
}

/**
 * A room is "live" when its host is actively publishing. Since only the coin's
 * dev is granted publish rights, any publishing participant means the dev is on
 * air. Returns a map of ticker -> status; unknown/empty rooms are not live.
 */
export async function getLiveStatus(
  tickers: string[]
): Promise<Map<string, LiveStatus>> {
  const result = new Map<string, LiveStatus>();
  for (const t of tickers) result.set(t, { live: false, viewers: 0 });

  const svc = client();
  if (!svc || tickers.length === 0) return result;

  let rooms;
  try {
    rooms = await svc.listRooms(tickers);
  } catch {
    return result;
  }

  await Promise.all(
    rooms.map(async (room) => {
      if (!room.numParticipants) {
        result.set(room.name, { live: false, viewers: 0 });
        return;
      }
      let publishing = false;
      try {
        const participants = await svc.listParticipants(room.name);
        publishing = participants.some((p) => (p.tracks?.length ?? 0) > 0);
      } catch {
        // If we can't enumerate participants, fall back to presence.
        publishing = room.numParticipants > 0;
      }
      result.set(room.name, {
        live: publishing,
        viewers: room.numParticipants,
      });
    })
  );

  return result;
}
