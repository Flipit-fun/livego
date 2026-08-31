"use client";

import { useState } from "react";
import { useLocalParticipant, useRoomContext } from "@livekit/components-react";
import { useWallet } from "@/components/WalletContext";

export default function Controls({ ticker }: { ticker: string }) {
  const room = useRoomContext();
  const { auth } = useWallet();
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

  const leave = async () => {
    // If the host leaves, close the room for everyone.
    if (canPublish && auth) {
      try {
        await fetch("/api/livekit/close", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            room: room.name,
            address: auth.address,
            message: auth.message,
            signature: auth.signature,
          }),
          keepalive: true,
        });
      } catch {
        // best-effort; disconnecting still ends our publish so viewers bounce
      }
    }
    room.disconnect();
  };

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
          <i className="lgr-listen-dot" />
          Listening to ${ticker} - only the dev can broadcast.
        </span>
      )}

      <button className="btn btn-sm lgr-leave" onClick={leave}>
        {canPublish ? "End stream" : "Leave"}
      </button>
    </div>
  );
}
