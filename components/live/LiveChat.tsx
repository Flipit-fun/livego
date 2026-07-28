"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@livekit/components-react";
import { shortenAddress } from "@/components/WalletContext";

export default function LiveChat() {
  const { chatMessages, send, isSending } = useChat();
  const [msg, setMsg] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [chatMessages]);

  const submit = async () => {
    const v = msg.trim();
    if (!v || isSending) return;
    await send(v);
    setMsg("");
  };

  return (
    <aside className="lgr-chat glass">
      <div className="lgr-chat-head">Room chat</div>

      <div className="lgr-chat-log" ref={scrollRef}>
        {chatMessages.length === 0 && (
          <p className="lgr-chat-empty">No messages yet. Say hello.</p>
        )}
        {chatMessages.map((m) => {
          const who = m.from?.name || m.from?.identity || "anon";
          return (
            <div className="msg" key={m.id ?? `${m.timestamp}-${who}`}>
              <span className="who">{shortenAddress(who)}</span>
              <span className="txt">{m.message}</span>
            </div>
          );
        })}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Say something to the room"
          aria-label="Message the room"
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submit();
          }}
        />
        <button
          className="send"
          aria-label="Send message"
          onClick={submit}
          disabled={isSending}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#221B00"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
