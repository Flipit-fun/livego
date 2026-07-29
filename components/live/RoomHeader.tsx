"use client";

import Link from "next/link";
import { useParticipants } from "@livekit/components-react";
import LogoMark from "@/components/LogoMark";

export default function RoomHeader({ ticker }: { ticker: string }) {
  const participants = useParticipants();

  return (
    <header className="lgr-header glass">
      <Link href="/" className="brand" aria-label="Back to Livego">
        <LogoMark size={22} />
        Livego
      </Link>

      <span className="onair">
        <i />
        ON AIR
      </span>
      <span className="room-tick">${ticker}</span>

      <span className="lgr-viewers">
        <b>{participants.length.toLocaleString()}</b> in room
      </span>
    </header>
  );
}
