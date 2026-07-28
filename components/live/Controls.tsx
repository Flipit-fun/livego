"use client";

import { useState } from "react";
import { useLocalParticipant, useRoomContext } from "@livekit/components-react";

export default function Controls({ ticker }: { ticker: string }) {
  const room = useRoomContext();
  const {
    localParticipant,
    isMicrophoneEnabled,
    isCameraEnabled,
    isScreenShareEnabled,
  } = useLocalParticipant();
  const [busy, setBusy] = useState(false);

  const canPublish = localParticipant.permissions?.canPublish ?? false;

  const guard = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    try {
      await fn();
    } catch (err) {
      console.error("livekit control error", err);
    } finally {
      setBusy(false);
    }
  };

  const toggleMic = () =>
    guard(() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled));
  const toggleCam = () =>
    guard(() => localParticipant.setCameraEnabled(!isCameraEnabled));
  const toggleScreen = () =>
    guard(() => localParticipant.setScreenShareEnabled(!isScreenShareEnabled));

  return (
    <div className="lgr-controls glass">
      {canPublish ? (
        <>
          <button
            className={"lgr-ctl" + (isMicrophoneEnabled ? " on" : "")}
            onClick={toggleMic}
            disabled={busy}
          >
            {isMicrophoneEnabled ? "Mic on" : "Mic off"}
          </button>
          <button
            className={"lgr-ctl" + (isCameraEnabled ? " on" : "")}
            onClick={toggleCam}
            disabled={busy}
          >
            {isCameraEnabled ? "Camera on" : "Camera off"}
          </button>
          <button
            className={"lgr-ctl" + (isScreenShareEnabled ? " on" : "")}
            onClick={toggleScreen}
            disabled={busy}
          >
            {isScreenShareEnabled ? "Sharing screen" : "Share screen"}
          </button>
        </>
      ) : (
        <span className="lgr-viewer-note">
          Watching ${ticker}. Ask the host for a seat to speak.
        </span>
      )}

      <button className="btn btn-sm lgr-leave" onClick={() => room.disconnect()}>
        Leave room
      </button>
    </div>
  );
}
