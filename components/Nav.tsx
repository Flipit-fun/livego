"use client";

import ConnectButton from "./ConnectButton";

export default function Nav() {
  return (
    <nav className="nav glass">
      <div className="brand">
        <span className="tally" />
        Livego
      </div>
      <div className="nav-links">
        <a href="#wallet">Your wallet</a>
        <a href="#studio">Studio</a>
        <a href="#rooms">Live now</a>
        <a href="#">Docs</a>
      </div>
      <ConnectButton className="btn btn-sm" showAddress />
    </nav>
  );
}
