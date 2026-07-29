"use client";

import { useEffect, useState } from "react";
import ConnectButton from "./ConnectButton";
import LogoMark from "./LogoMark";
import ThemeToggle from "./ThemeToggle";

const X_URL = "https://x.com/TryLiveGo";

export default function Nav() {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className={"nav" + (stuck ? " stuck" : "")}>
      <div className="brand">
        <LogoMark />
        Livego
      </div>
      <div className="nav-links">
        <a href="#holdings">Holdings</a>
        <a href="#studio">Studio</a>
        <a href="#rooms">Rooms</a>
        <a href="/launch">Launch</a>
      </div>
      <div className="nav-right">
        <ThemeToggle />
        <a
          className="nav-x"
          href={X_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Follow Livego on X"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
          </svg>
        </a>
        <ConnectButton className="btn btn-sm" />
      </div>
    </nav>
  );
}
