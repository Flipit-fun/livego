import Link from "next/link";
import { gridRooms } from "@/lib/data";

export default function Rooms() {
  return (
    <section className="sec" id="rooms">
      <div className="sec-head rv">
        <div className="eyebrow">Live right now</div>
        <h2>Rooms with the door open.</h2>
        <p>
          Anything you hold, you can walk into. Anything you don&apos;t, you can
          watch from the back.
        </p>
      </div>
      <div className="rooms">
        {gridRooms.map((r, i) => (
          <Link className="glass room rv" key={i} href={`/room/${r[0]}`}>
            <div className="room-thumb">
              <span className="flag">LIVE</span>
              <span className="glyph">{r[0].slice(0, 3)}</span>
              <span className="cnt">{r[3]} watching</span>
            </div>
            <div className="room-meta">
              <div className="t">{r[1]}</div>
              <div className="s">
                ${r[0]} · {r[2]}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
