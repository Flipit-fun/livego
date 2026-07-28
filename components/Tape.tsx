import { tapeRooms } from "@/lib/data";

export default function Tape() {
  const items = [...tapeRooms, ...tapeRooms];
  return (
    <div className="tape">
      <div className="tape-track">
        {items.map((r, i) => (
          <span className="tape-item" key={i}>
            <i />
            <b>${r[0]}</b> {r[1]}{" "}
            <span style={{ color: "var(--ink-45)" }}>{r[2]} watching</span>
          </span>
        ))}
      </div>
    </div>
  );
}
