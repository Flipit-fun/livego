"use client";

import { useEffect, useState } from "react";
import type { AuthProof } from "@/components/WalletContext";

interface TokenState {
  token: string | null;
  url: string | null;
  canPublish: boolean;
  loading: boolean;
  error: string | null;
}

interface TokenParams {
  room?: string;
  auth: AuthProof | null;
}

export function useLiveKitToken({ room, auth }: TokenParams): TokenState {
  const [state, setState] = useState<TokenState>({
    token: null,
    url: null,
    canPublish: false,
    loading: true,
    error: null,
  });

  // Serialize the proof so the effect only re-runs when it truly changes.
  const authKey = auth ? `${auth.address}:${auth.signature}:${auth.demo}` : "";

  useEffect(() => {
    if (!room || !auth) return;
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    fetch("/api/livekit/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        room,
        address: auth.address,
        message: auth.message,
        signature: auth.signature,
        demo: auth.demo,
      }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "Failed to fetch token");
        return data as { token: string; url: string; canPublish: boolean };
      })
      .then((data) => {
        if (!cancelled)
          setState({
            token: data.token,
            url: data.url,
            canPublish: Boolean(data.canPublish),
            loading: false,
            error: null,
          });
      })
      .catch((err: Error) => {
        if (!cancelled)
          setState({
            token: null,
            url: null,
            canPublish: false,
            loading: false,
            error: err.message,
          });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room, authKey]);

  return state;
}
