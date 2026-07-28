"use client";

import { useRouter } from "next/navigation";
import { coins as demoCoins, type Coin } from "@/lib/data";
import { useRoom } from "./RoomContext";
import { useWallet } from "./WalletContext";

export default function Wallet() {
  const { selectedTicker, selectRoom } = useRoom();
  const { connected, short, address, connect, coins, coinsLoading } = useWallet();
  const router = useRouter();

  // Before connecting (or when on-chain reads aren't configured) show the demo
  // holdings so the panel is never empty.
  const list = coins.length ? coins : demoCoins;

  const enterRoom = async (c: Coin) => {
    if (!connected) {
      const addr = await connect();
      if (!addr) return;
    }
    // Real coins route by contract address (unique); demo coins by ticker.
    const key = c.address ?? c.t;
    router.push(`/room/${key}?t=${encodeURIComponent(c.t)}`);
  };

  const isDev = (c: Coin) =>
    !!c.dev && !!address && c.dev.toLowerCase() === address.toLowerCase();

  // Dev of the coin can start/rejoin the stream; holders can only join once the
  // dev is live.
  const renderAction = (c: Coin) => {
    if (isDev(c)) {
      return (
        <button
          className="btn btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            enterRoom(c);
          }}
        >
          {c.live ? "Rejoin" : "Go live"}
        </button>
      );
    }
    if (c.live) {
      return (
        <button
          className="btn btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            enterRoom(c);
          }}
        >
          Join
        </button>
      );
    }
    return (
      <button className="btn btn-sm btn-ghost" disabled title="The dev hasn't started a stream yet">
        Not live
      </button>
    );
  };

  return (
    <section className="sec" id="wallet">
      <div className="sec-head rv">
        <div className="eyebrow">Step one, and the only one</div>
        <h2>The wallet is the guest list.</h2>
        <p>
          Livego reads what you hold and builds your channel list from it. Every
          coin in the wallet is a door you can open. Every holder of that coin is
          already inside.
        </p>
      </div>

      <div className="wallet-grid">
        <div>
          <div className="claim-list">
            <div className="claim rv">
              <span className="k mono">01</span>
              <div>
                <h3>Connect once</h3>
                <p>
                  Sign a message with your RobinHood Chain wallet. Nothing moves,
                  nothing is approved. Livego just reads the balances.
                </p>
              </div>
            </div>
            <div className="claim rv">
              <span className="k mono">02</span>
              <div>
                <h3>Pick the coin</h3>
                <p>
                  Your holdings load as rooms. Some are already live — join those.
                  The quiet ones are yours to open.
                </p>
              </div>
            </div>
            <div className="claim rv">
              <span className="k mono">03</span>
              <div>
                <h3>Go live</h3>
                <p>
                  One press puts you on air. Camera, screen, or voice only. The
                  room fills with people who hold what you hold.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass panel rv" id="walletPanel">
          <div className="panel-head">
            <span className="addr mono">{connected && short ? short : "0x4f2c…9ce1"}</span>
            <span className="chip">RobinHood Chain</span>
          </div>
          <div>
            {coinsLoading && (
              <div className="coin-loading mono">Reading balances…</div>
            )}
            {list.map((c) => (
              <div
                key={c.t}
                className={"coin" + (c.t === selectedTicker ? " on" : "")}
                tabIndex={0}
                onClick={() => selectRoom(c.t)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectRoom(c.t);
                  }
                }}
              >
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
                <span className="golive">{renderAction(c)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
