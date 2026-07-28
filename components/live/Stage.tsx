"use client";

import { useTracks, ParticipantTile } from "@livekit/components-react";
import { Track } from "livekit-client";
import type { TrackReferenceOrPlaceholder } from "@livekit/components-react";

const MAX_SEATS = 8;

function keyFor(t: TrackReferenceOrPlaceholder, i: number): string {
  const sid = t.publication?.trackSid ?? "placeholder";
  return `${t.participant.identity}_${t.source}_${sid}_${i}`;
}

export default function Stage() {
  const tracks = useTracks(
    [
      { source: Track.Source.ScreenShare, withPlaceholder: false },
      { source: Track.Source.Camera, withPlaceholder: true },
    ],
    { onlySubscribed: false }
  );

  const screen = tracks.filter((t) => t.source === Track.Source.ScreenShare);
  const cams = tracks.filter((t) => t.source === Track.Source.Camera);

  // A shared screen takes the main stage; otherwise the first camera does.
  const featured = screen[0] ?? cams[0];
  const seatTracks = (screen[0] ? cams : cams.slice(1)).slice(0, MAX_SEATS);
  const emptySeats = Math.max(0, MAX_SEATS - seatTracks.length - (screen[0] ? 0 : 1));

  return (
    <div className="lgr-stage">
      <div className="lgr-featured">
        {featured ? (
          <ParticipantTile trackRef={featured} />
        ) : (
          <div className="lgr-featured-empty">
            <span className="share-label">Waiting for the host to go live</span>
          </div>
        )}
        {screen[0] && (
          <span className="lgr-share-flag">
            {screen[0].participant.name || screen[0].participant.identity} is
            sharing a screen
          </span>
        )}
      </div>

      <div className="lgr-seats" aria-label="Stage seats">
        {seatTracks.map((t, i) => (
          <div className="lgr-seat" key={keyFor(t, i)}>
            <ParticipantTile trackRef={t} />
          </div>
        ))}
        {Array.from({ length: emptySeats }).map((_, i) => (
          <div className="lgr-seat lgr-seat-empty" key={`empty_${i}`}>
            <span>seat {seatTracks.length + i + 1 + (screen[0] ? 0 : 1)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
