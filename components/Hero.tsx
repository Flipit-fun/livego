"use client";

import ConnectButton from "./ConnectButton";
import Console from "./Console";

export default function Hero() {
  return (
    <header className="hero">
      <div>
        <div className="eyebrow">Live on RobinHood Chain</div>
        <h1>
          Your bags are
          <br />
          already a <span className="lit">channel</span>.
        </h1>
        <p className="lede">
          Connect your wallet and every coin you hold turns into a room you can
          broadcast from. Screen share the chart, pull holders onto the stage,
          and let the token&apos;s own chat run the show.
        </p>
        <div className="hero-cta">
          <ConnectButton className="btn" />
          <a className="btn btn-ghost" href="#rooms">
            Watch a room
          </a>
        </div>
        <div className="hero-note">
          <span>
            <i className="dot" />
            No token deploy needed
          </span>
          <span>
            <i className="dot" />
            Hold to speak, hold to chat
          </span>
          <span>
            <i className="dot" />
            Stage of eight
          </span>
        </div>
      </div>

      <Console />
    </header>
  );
}
