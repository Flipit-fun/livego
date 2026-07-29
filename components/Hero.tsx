"use client";

import ConnectButton from "./ConnectButton";
import { useDisplayRooms } from "@/lib/useDisplayRooms";

export default function Hero() {
  const { stats } = useDisplayRooms();

  return (
    <header className="hero">
      <div className="eyebrow">Built on RobinHood Chain</div>
      <h1>
        Live streaming for <span className="lit">tokenized assets</span>.
      </h1>
      <p className="lede">
        Connect your wallet and every token you hold becomes a room you can watch
        from. When the token&apos;s dev goes live, you&apos;re already inside —
        the chart, the voice, and the chat, all in one tab.
      </p>
      <div className="hero-cta">
        <ConnectButton className="btn" />
        <a className="btn btn-ghost" href="#rooms">
          Browse live rooms
        </a>
      </div>
      <div className="glass stat-row">
        <div className="stat">
          <b>{stats.live}</b>
          <span>Rooms live</span>
        </div>
        <div className="stat">
          <b>{stats.watching.toLocaleString()}</b>
          <span>Watching now</span>
        </div>
        <div className="stat">
          <b>{stats.tokens}</b>
          <span>Tokens streaming</span>
        </div>
        <div className="stat">
          <b>Listen</b>
          <span>Broadcast model</span>
        </div>
      </div>
    </header>
  );
}
