"use client";

import { useEffect, useRef, useState } from "react";
import { useParticipants, useRoomContext } from "@livekit/components-react";
import { useRouter } from "next/navigation";

/**
 * Closes the room for a viewer once the host leaves. The host is the only
 * participant with publish rights, so when no such participant remains after
 * one has been seen, the stream is over. Hosts are exempt (they end via the
 * button, which also deletes the room server-side).
 */
export default function HostGate({ isHost }: { isHost: boolean }) {
  const participants = useParticipants();
  const room = useRoomContext();
  const router = useRouter();
  const hostSeen = useRef(false);
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    if (isHost || ended) return;

    const hostHere = participants.some(
      (p) => p.permissions?.canPublish === true
    );
    if (hostHere) hostSeen.current = true;

    if (hostSeen.current && !hostHere) {
      setEnded(true);
      room.disconnect();
      const t = setTimeout(() => router.push("/"), 2600);
      return () => clearTimeout(t);
    }
  }, [participants, isHost, ended, room, router]);

  if (!ended) return null;

  return (
    <div className="lgr-ended">
      <div className="lgr-ended-card glass">
        <strong style={{ fontSize: 18 }}>Stream ended</strong>
        <p style={{ color: "var(--ink-70)" }}>The host has left the room.</p>
        <span className="lgr-spinner" aria-hidden="true" />
      </div>
    </div>
  );
}
