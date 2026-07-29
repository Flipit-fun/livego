"use client";

import { useDisplayRooms } from "@/lib/useDisplayRooms";

export default function Tape() {
  const { held } = useDisplayRooms();
  const live = held.filter((r) => r.live);
  if (live.length === 0) return null;

  const items = [...live, ...live];

  return (
    <div className="tape">
      <div className="tape-track">
        {items.map((r, i) => (
          <span className="tape-item" key={i}>
            <i />
            <b>${r.t}</b> {r.title}{" "}
            <span style={{ color: "var(--ink-45)" }}>
              {r.v.toLocaleString()} watching
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
