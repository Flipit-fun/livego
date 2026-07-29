"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "./WalletContext";
import { useToast } from "./Toast";
import type { Coin } from "@/lib/data";

export default function Holdings() {
  const { connected, short, address, coins, coinsLoading, connect } = useWallet();
  const router = useRouter();
  const toast = useToast();
  const [q, setQ] = useState("");

  const isDev = (c: Coin) =>
    !!c.dev && !!address && c.dev.toLowerCase() === address.toLowerCase();

  const enterRoom = (c: Coin) => {
    const key = c.address ?? c.t;
    router.push(`/room/${key}?t=${encodeURIComponent(c.t)}`);
  };

  const action = (c: Coin) => {
    if (isDev(c)) {
      return (
        <button className="btn btn-xs" onClick={() => enterRoom(c)}>
          {c.live ? "Rejoin" : "Go live"}
        </button>
      );
    }
    return (
      <button className="btn btn-xs" onClick={() => enterRoom(c)}>
        Join
      </button>
    );
  };

  const filtered = coins.filter((c) => {
    const s = q.trim().toLowerCase();
    return !s || c.t.toLowerCase().includes(s) || c.n.toLowerCase().includes(s);
  });

  return (
    <section className="sec" id="holdings">
      <div className="sec-head rv">
        <div className="eyebrow">How you get in</div>
        <h2>Hold the token, walk into the room.</h2>
        <p>
          No follow, no invite code, no application. Livego reads your balances,
          and every token in the wallet opens a door - watch when the dev is
          live, or open your own coin&apos;s room.
        </p>
      </div>

      <div className="wallet-grid">
        <div>
          <div className="claim rv">
            <span className="k mono">01</span>
            <div>
              <h3>Connect once</h3>
              <p>
                Sign a message with your RobinHood Chain wallet. Nothing is
                approved and nothing moves - Livego only reads balances.
              </p>
            </div>
          </div>
          <div className="claim rv">
            <span className="k mono">02</span>
            <div>
              <h3>Your holdings load as rooms</h3>
              <p>
                Each token becomes a room. The ones whose dev is broadcasting are
                marked live. Coins you created are yours to open.
              </p>
            </div>
          </div>
          <div className="claim rv">
            <span className="k mono">03</span>
            <div>
              <h3>Watch, or go live</h3>
              <p>
                Hold a coin and its dev is live? Join and listen. Created the
                coin yourself? Press once to go on air with voice, camera, or
                screen.
              </p>
            </div>
          </div>
        </div>

        <div className="glass panel rv" id="walletPanel">
          {!connected ? (
            <div className="empty">
              <h3>No wallet connected</h3>
              <p>
                Connect to load your tokens on RobinHood Chain and see which
                rooms are already live.
              </p>
              <button
                className="btn"
                onClick={() =>
                  connect().then((a) => a && toast("Wallet connected"))
                }
              >
                Connect wallet
              </button>
            </div>
          ) : (
            <div>
              <div className="panel-head">
                <span className="addr mono">{short}</span>
                <span className="chip">RobinHood Chain</span>
              </div>
              <div className="search">
                <span className="mono">FIND</span>
                <input
                  type="text"
                  placeholder="Filter by name or ticker"
                  aria-label="Filter tokens"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                />
              </div>

              {coinsLoading && coins.length === 0 && (
                <div className="coin-loading mono">Reading balances…</div>
              )}
              {!coinsLoading && coins.length === 0 && (
                <div className="no-hits">
                  No tokens found in this wallet on RobinHood Chain.
                </div>
              )}
              {coins.length > 0 && filtered.length === 0 && (
                <div className="no-hits">
                  No token matches that. Try a ticker like HOOD.
                </div>
              )}

              {filtered.map((c) => (
                <div className="coin" key={c.address ?? c.t}>
                  <span className="coin-mark">{c.t.slice(0, 2)}</span>
                  <span className="coin-name">
                    <span className="t">
                      {c.n}
                      {isDev(c) && <span className="you-tag mono">you</span>}
                    </span>
                    <span className="s">${c.t}</span>
                  </span>
                  {c.live && (
                    <span className="live-flag">
                      <i />
                      LIVE
                    </span>
                  )}
                  <span className="coin-bal">
                    {c.b}
                    <em>{c.usd}</em>
                  </span>
                  {action(c)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
