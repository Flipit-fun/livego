"use client";

import { useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useWallet } from "@/components/WalletContext";
import { useLiveKitToken } from "@/lib/useLiveKitToken";
import LiveRoom from "@/components/live/LiveRoom";

export default function RoomPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const rawKey = Array.isArray(params.token) ? params.token[0] : params.token;
  const roomKey = rawKey || "";
  // Display symbol comes from ?t=, falling back to the room key.
  const display = (searchParams.get("t") || roomKey).toUpperCase();

  const { address, auth, status, connect } = useWallet();

  // The wallet is the login - ensure we have a session before joining.
  useEffect(() => {
    if (status === "disconnected") connect();
  }, [status, connect]);

  const { token, url, canPublish, loading, error } = useLiveKitToken({
    room: roomKey,
    auth,
  });

  if (!address || !auth || loading) {
    return (
      <RoomStatus>
        <span className="lgr-spinner" aria-hidden="true" />
        {status === "connecting"
          ? "Connecting wallet…"
          : !address
            ? "Waiting for wallet…"
            : `Joining $${display}…`}
      </RoomStatus>
    );
  }

  if (error || !token || !url) {
    return (
      <RoomStatus>
        <strong style={{ fontSize: 18 }}>{`Can't open $${display}`}</strong>
        <p style={{ maxWidth: "46ch", color: "var(--ink-70)", lineHeight: 1.55 }}>
          {error ?? "The streaming service returned no token."}
        </p>
        {error?.includes("not configured") && (
          <pre className="lgr-env">
{`# .env.local
LIVEKIT_API_KEY=your_key
LIVEKIT_API_SECRET=your_secret
NEXT_PUBLIC_LIVEKIT_URL=wss://your-project.livekit.cloud`}
          </pre>
        )}
        <Link className="btn btn-ghost" href="/">
          Back to StreamGo
        </Link>
      </RoomStatus>
    );
  }

  return (
    <LiveRoom token={token} serverUrl={url} ticker={display} host={canPublish} />
  );
}

function RoomStatus({ children }: { children: React.ReactNode }) {
  return (
    <div className="lgr-status">
      <div className="lgr-status-card glass">{children}</div>
    </div>
  );
}
