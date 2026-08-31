"use client";

import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import { useRouter } from "next/navigation";
import RoomHeader from "./RoomHeader";
import Stage from "./Stage";
import Controls from "./Controls";
import LiveChat from "./LiveChat";
import HostGate from "./HostGate";

interface LiveRoomProps {
  token: string;
  serverUrl: string;
  ticker: string;
  host: boolean;
}

export default function LiveRoom({ token, serverUrl, ticker, host }: LiveRoomProps) {
  const router = useRouter();

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect
      audio={host}
      video={host}
      data-lk-theme="default"
      className="lgr-page"
      onDisconnected={() => router.push("/")}
    >
      <RoomHeader ticker={ticker} />

      <div className="lgr-main">
        <div className="lgr-stage-col">
          <Stage />
          <Controls ticker={ticker} />
        </div>
        <LiveChat />
      </div>

      <HostGate isHost={host} />
      <RoomAudioRenderer />
    </LiveKitRoom>
  );
}
