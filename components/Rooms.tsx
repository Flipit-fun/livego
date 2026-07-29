"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAddress } from "viem";
import { useWallet } from "./WalletContext";
import { useToast } from "./Toast";
import { useDisplayRooms, type RoomCard } from "@/lib/useDisplayRooms";

interface LaunchEntry {
  token: string;
  deployer: string;
  name: string | null;
  symbol: string | null;
  logo: string | null;
  description: string | null;
  live: boolean;
  viewers: number;
}

export default function Rooms() {
  const { held } = useDisplayRooms();
  const { connected, address, connect } = useWallet();
  const router = useRouter();
  const toast = useToast();
  const [ca, setCa] = useState("");
  const [looking, setLooking] = useState(false);
  const [found, setFound] = useState<RoomCard[]>([]);
  const [launches, setLaunches] = useState<LaunchEntry[]>([]);
  const [loadingLaunches, setLoadingLaunches] = useState(true);

  // Fetch Livego-launched tokens
  useEffect(() => {
    fetch("/api/launches")
      .then((r) => r.json())
      .then((d) => setLaunches(d.launches || []))
      .catch(() => {})
      .finally(() => setLoadingLaunches(false));
  }, []);

  // Refresh every 15s for live status
  useEffect(() => {
    const id = setInterval(() => {
      fetch("/api/launches")
        .then((r) => r.json())
        .then((d) => setLaunches(d.launches || []))
        .catch(() => {});
    }, 15000);
    return () => clearInterval(id);
  }, []);

  const open = async (r: RoomCard) => {
    if (!connected) {
      const a = await connect();
      if (!a) return;
    }
    const key = r.address ?? r.t;
    router.push(`/room/${key}?t=${encodeURIComponent(r.t)}`);
  };

  const openByAddress = async (token: string, symbol: string) => {
    if (!connected) {
      const a = await connect();
      if (!a) return;
    }
    router.push(`/room/${token}?t=${encodeURIComponent(symbol)}`);
  };

  const lookup = async () => {
    const q = ca.trim();
    if (!isAddress(q)) {
      toast("Enter a valid contract address (0x...)");
      return;
    }
    if (found.some((r) => r.address?.toLowerCase() === q.toLowerCase())) {
      toast("That room is already listed below");
      return;
    }
    setLooking(true);
    try {
      const res = await fetch(`/api/room/lookup?address=${q}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lookup failed");
      const r = data.room;
      setFound((prev) => [
        {
          t: r.t,
          n: r.n,
          title: `${r.t} room`,
          host: r.dev ? `${r.dev.slice(0, 6)}...${r.dev.slice(-4)}` : "-",
          v: r.v,
          live: r.live,
          mine: false,
          address: r.address,
          dev: r.dev,
        },
        ...prev,
      ]);
      setCa("");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Lookup failed");
    } finally {
      setLooking(false);
    }
  };

  const isMine = (r: RoomCard) =>
    !!r.dev && !!address && r.dev.toLowerCase() === address.toLowerCase();

  const Card = ({ r, k }: { r: RoomCard; k: string }) => (
    <div className="glass room" key={k} onClick={() => open(r)}>
      <div className="room-thumb">
        <span className={"flag" + (r.live ? "" : " soon")}>
          {r.live ? "LIVE" : "OFFLINE"}
        </span>
        <span className="glyph">{r.t.slice(0, 3)}</span>
        <span className="cnt">
          {r.live ? `${r.v.toLocaleString()} watching` : "not live yet"}
        </span>
      </div>
      <div className="room-meta">
        <div className="t">{r.title}</div>
        <div className="s">
          ${r.t}
          {isMine(r) ? " - your coin" : r.mine ? " - you hold this" : ""}
        </div>
      </div>
    </div>
  );

  return (
    <section className="sec" id="rooms">
      <div className="sec-head rv">
        <div className="eyebrow">Rooms</div>
        <h2>Tokens launched on Livego.</h2>
        <p>
          Every token launched through Livego appears here. Paste any contract
          address to join a room, or launch your own.
        </p>
      </div>

      {/* Launch + search bar */}
      <div className="rooms-bar rv">
        <Link href="/launch" className="btn btn-sm">
          Launch a token
        </Link>
        <div className="search" style={{ margin: 0, flex: 1, minWidth: 230 }}>
          <span className="mono">CA</span>
          <input
            type="text"
            placeholder="Paste a token contract address (0x...)"
            aria-label="Token contract address"
            value={ca}
            onChange={(e) => setCa(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") lookup();
            }}
          />
          <button className="btn btn-xs" onClick={lookup} disabled={looking}>
            {looking ? "..." : "Find"}
          </button>
        </div>
      </div>

      {/* Lookup results */}
      {found.length > 0 && (
        <div className="rooms" style={{ marginBottom: 24 }}>
          {found.map((r, i) => (
            <Card r={r} k={`found_${r.address}_${i}`} key={`found_${r.address}_${i}`} />
          ))}
        </div>
      )}

      {/* Livego-launched tokens */}
      {launches.length > 0 && (
        <>
          <div className="side-h" style={{ padding: "0 2px 12px" }}>
            Launched on Livego
          </div>
          <div className="rooms">
            {launches.map((l) => (
              <div
                className="glass room"
                key={l.token}
                onClick={() => openByAddress(l.token, l.symbol || "TOKEN")}
              >
                <div className="room-thumb">
                  <span className={"flag" + (l.live ? "" : " soon")}>
                    {l.live ? "LIVE" : "OFFLINE"}
                  </span>
                  <span className="glyph">
                    {(l.symbol || "TKN").slice(0, 3)}
                  </span>
                  <span className="cnt">
                    {l.live ? `${l.viewers} watching` : "not live yet"}
                  </span>
                </div>
                <div className="room-meta">
                  <div className="t">{l.name || l.symbol || "Token"}</div>
                  <div className="s">
                    ${l.symbol || "TOKEN"} - {l.deployer.slice(0, 6)}...
                    {l.deployer.slice(-4)}
                    {l.deployer.toLowerCase() === address?.toLowerCase()
                      ? " - your coin"
                      : ""}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      {!loadingLaunches && launches.length === 0 && (
        <div className="no-hits" style={{ marginBottom: 24 }}>
          No tokens launched through Livego yet.{" "}
          <Link href="/launch" style={{ color: "var(--amber)", textDecoration: "underline" }}>
            Be the first.
          </Link>
        </div>
      )}
      {loadingLaunches && (
        <div className="no-hits" style={{ marginBottom: 24 }}>
          Loading launches...
        </div>
      )}

      {/* Held tokens */}
      {connected && held.length > 0 && (
        <>
          <div className="side-h" style={{ padding: "16px 2px 12px" }}>
            Tokens you hold
          </div>
          <div className="rooms">
            {held.map((r, i) => (
              <Card r={r} k={`held_${r.address ?? r.t}_${i}`} key={`held_${r.address ?? r.t}_${i}`} />
            ))}
          </div>
        </>
      )}

      {!connected && (
        <div className="no-hits">
          Connect your wallet to see rooms for the tokens you hold.
        </div>
      )}
    </section>
  );
}
