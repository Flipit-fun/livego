"use client";

import { useEffect, useRef } from "react";
import { tickers, verbs } from "@/lib/data";
import { useReducedMotion } from "@/lib/useReducedMotion";

function rowText(): string {
  let out = "";
  for (let i = 0; i < 9; i++) {
    const t = tickers[(Math.random() * tickers.length) | 0];
    const v = verbs[(Math.random() * verbs.length) | 0];
    const n = ((Math.random() * 4000) | 0).toLocaleString();
    out += `<span>$<b>${t}</b> &nbsp;${v}&nbsp; ${n} watching &nbsp;·&nbsp;</span>`;
  }
  return out;
}

export default function Background() {
  const baseRef = useRef<HTMLDivElement>(null);
  const litRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // build the scrolling data wall
  useEffect(() => {
    const base = baseRef.current;
    const lit = litRef.current;
    if (!base || !lit) return;

    base.innerHTML = "";
    const rows = 26;
    for (let r = 0; r < rows; r++) {
      const d = document.createElement("div");
      d.className = "wall-row";
      const inner = rowText();
      d.innerHTML = inner + inner + inner;
      const dur = (60 + Math.random() * 60).toFixed(1);
      if (!reduce) d.style.animation = `${r % 2 ? "drift-r" : "drift-l"} ${dur}s linear infinite`;
      base.appendChild(d);
    }

    lit.innerHTML = base.innerHTML;
    if (!reduce) {
      Array.from(lit.children).forEach((c, i) => {
        const src = base.children[i] as HTMLElement;
        (c as HTMLElement).style.animation = src.style.animation;
      });
    }
  }, [reduce]);

  // cursor lens follow
  useEffect(() => {
    let tx = window.innerWidth * 0.5;
    let ty = window.innerHeight * 0.4;
    let cx = tx;
    let cy = ty;
    let raf: number | null = null;

    const loop = () => {
      cx += (tx - cx) * 0.14;
      cy += (ty - cy) * 0.14;
      document.documentElement.style.setProperty("--mx", cx.toFixed(1) + "px");
      document.documentElement.style.setProperty("--my", cy.toFixed(1) + "px");
      if (Math.abs(tx - cx) > 0.4 || Math.abs(ty - cy) > 0.4) {
        raf = requestAnimationFrame(loop);
      } else {
        raf = null;
      }
    };

    const onMove = (e: PointerEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div className="wall" aria-hidden="true">
        <div className="wall-layer wall-base" ref={baseRef} />
        <div className="wall-layer wall-lit" ref={litRef} />
        <div className="wall-grid" />
      </div>
      <div className="lens-ring" aria-hidden="true" />
    </>
  );
}
