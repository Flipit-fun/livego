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
          Connect your wallet and every coin you created turns into a room you
          can broadcast from. Screen share the chart, talk to every holder, and
          let the token&apos;s own chat run the show.
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
            Devs go live from their coin
          </span>
          <span>
            <i className="dot" />
            Holders watch and chat
          </span>
          <span>
            <i className="dot" />
            One broadcast, every holder
          </span>
        </div>
      </div>

      <Console />
    </header>
  );
}
