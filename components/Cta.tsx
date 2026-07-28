"use client";

import ConnectButton from "./ConnectButton";

export default function Cta() {
  return (
    <section className="sec" style={{ paddingTop: 20 }}>
      <div className="glass cta-slab rv">
        <div className="eyebrow">Nothing to install</div>
        <h2>Open the room your coin has been waiting for.</h2>
        <p>
          Connect, pick a ticker, press once. The people holding it are already
          refreshing the chart — give them somewhere to go.
        </p>
        <div className="hero-cta">
          <ConnectButton className="btn" />
          <a className="btn btn-ghost" href="#rooms">
            Browse live rooms
          </a>
        </div>
      </div>
    </section>
  );
}
