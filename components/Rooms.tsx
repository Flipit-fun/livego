"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { isAddress } from "viem";
import { useWallet } from "./WalletContext";
import { useToast } from "./Toast";
import { useDisplayRooms, type RoomCard } from "@/lib/useDisplayRooms";

export default function Rooms() {
  const { held } = useDisplayRooms();
  const { connected, address, connect } = useWallet();
  const router = useRouter();
  const toast = useToast();
  const [ca, setCa] = useState("");
  const [looking, setLooking] = useState(false);
  const [found, setFound] = useState<RoomCard[]>([]);

  const open = async (r: RoomCard) => {
    if (!connected) {
      const a = await connect();
      if (!a) return;
    }
    const key = r.address ?? r.t;
    router.push(`/room/${key}?t=${encodeURIComponent(r.t)}`);
  };

  const lookup = async () => {
    const q = ca.trim();
    if (!isAddress(q)) {
      toast("Enter a valid contract address (0x…)");
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
          host: r.dev ? `${r.dev.slice(0, 6)}…${r.dev.slice(-4)}` : "—",
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
          {isMine(r) ? " · your coin" : r.mine ? " · you hold this" : ""}
        </div>
      </div>
    </div>
  );

  return (
    <section className="sec" id="rooms">
      <div className="sec-head rv">
        <div className="eyebrow">Join a room</div>
        <h2>Open any token&apos;s room by address.</h2>
        <p>
          Paste a contract address to find its room and jump in — you can watch
          any token, held or not. Only a coin&apos;s creator can go on air; every
          one else listens.
        </p>
      </div>

      <div className="rooms-bar rv">
        <div className="search" style={{ margin: 0, width: "100%" }}>
          <span className="mono">CA</span>
          <input
            type="text"
            placeholder="Paste a token contract address (0x…)"
            aria-label="Token contract address"
            value={ca}
            onChange={(e) => setCa(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") lookup();
            }}
          />
          <button className="btn btn-sm" onClick={lookup} disabled={looking}>
            {looking ? "Finding…" : "Find room"}
          </button>
        </div>
      </div>

      {found.length > 0 && (
        <div className="rooms" style={{ marginBottom: 20 }}>
          {found.map((r, i) => (
            <Card r={r} k={`found_${r.address}_${i}`} key={`found_${r.address}_${i}`} />
          ))}
        </div>
      )}

      {connected ? (
        held.length > 0 ? (
          <>
            <div className="side-h" style={{ padding: "0 2px 12px" }}>
              Tokens you hold
            </div>
            <div className="rooms">
              {held.map((r, i) => (
                <Card r={r} k={`held_${r.address ?? r.t}_${i}`} key={`held_${r.address ?? r.t}_${i}`} />
              ))}
            </div>
          </>
        ) : (
          <div className="no-hits">
            No tokens found in this wallet on RobinHood Chain. Paste a contract
            address above to join any room.
          </div>
        )
      ) : (
        <div className="no-hits">
          Connect your wallet to see rooms for the tokens you hold — or paste a
          contract address above to join any room.
        </div>
      )}
    </section>
  );
}
