"use client";

import { useTracks, ParticipantTile } from "@livekit/components-react";
import { Track } from "livekit-client";

export default function Stage() {
  const tracks = useTracks(
    [
      { source: Track.Source.ScreenShare, withPlaceholder: false },
      { source: Track.Source.Camera, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  // Only the host publishes, so we simply show their stream: screen share takes
  // the stage, with the camera as a small picture-in-picture if both are on.
  const screen = tracks.find((t) => t.source === Track.Source.ScreenShare);
  const camera = tracks.find((t) => t.source === Track.Source.Camera);
  const featured = screen ?? camera;
  const pip = screen && camera ? camera : null;

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

        {screen && <span className="lgr-share-flag">sharing screen</span>}

        {pip && (
          <div className="lgr-pip">
            <ParticipantTile trackRef={pip} />
          </div>
        )}
      </div>
    </div>
  );
}
