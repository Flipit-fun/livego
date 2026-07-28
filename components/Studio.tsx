"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

export default function Studio() {
  const barsRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const bars = barsRef.current;
    if (!bars) return;
    bars.innerHTML = "";
    for (let i = 0; i < 11; i++) {
      const b = document.createElement("i");
      b.style.height = 16 + Math.random() * 58 + "px";
      if (!reduce) {
        b.style.animation = `wv ${(0.7 + Math.random() * 0.8).toFixed(2)}s ease-in-out infinite`;
        b.style.animationDelay = Math.random().toFixed(2) + "s";
      }
      bars.appendChild(b);
    }
  }, [reduce]);

  return (
    <section className="sec" id="studio">
      <div className="sec-head rv">
        <div className="eyebrow">Inside the room</div>
        <h2>A studio that fits in a tab.</h2>
        <p>
          Everything a token call needs and nothing a broadcast suite would sell
          you. Built for people who are one keystroke away from the chart anyway.
        </p>
      </div>

      <div className="controls">
        <div className="glass ctl rv">
          <div className="art">
            <div className="bars" ref={barsRef} />
          </div>
          <h3>Speak from the coin</h3>
          <p>
            Voice or camera, switched mid-stream without dropping the room.
            Holders hear you the second you unmute.
          </p>
          <div className="ctl-foot">Audio · Video</div>
        </div>

        <div className="glass ctl rv">
          <div className="art">
            <div
              className="win"
              style={{ left: 0, top: 6, width: 98, height: 62 }}
            />
            <div
              className="win"
              style={{
                left: 34,
                top: 22,
                width: 98,
                height: 62,
                background: "linear-gradient(150deg,#FFEFA8,#FFD84D)",
              }}
            />
          </div>
          <h3>Share the screen</h3>
          <p>
            Put the chart, the contract, or the whole desktop on the stage.
            Viewers see it at full resolution, not a compressed thumbnail.
          </p>
          <div className="ctl-foot">Screen · Window · Tab</div>
        </div>

        <div className="glass ctl rv">
          <div className="art">
            <div className="seats">
              <span className="seat full mono">1</span>
              <span className="seat full mono">2</span>
              <span className="seat full mono">3</span>
              <span className="seat mono">+</span>
              <span className="seat mono">+</span>
            </div>
          </div>
          <h3>Invite to the stage</h3>
          <p>
            Pull anyone in chat up beside you. Eight seats, revocable in one
            press, with the holder&apos;s balance shown next to their handle.
          </p>
          <div className="ctl-foot">Stage of eight</div>
        </div>
      </div>
    </section>
  );
}
