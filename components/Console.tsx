"use client";

import { useEffect, useRef, useState } from "react";
import { demoCoinFor, chats } from "@/lib/data";
import { useRoom } from "./RoomContext";

interface Msg {
  id: number;
  who: string;
  txt: string;
  mine: boolean;
}

export default function Console() {
  const { selectedTicker, reduce } = useRoom();
  const coin = demoCoinFor(selectedTicker);
  const room = coin.t;

  const [viewers, setViewers] = useState(1284);
  const viewersRef = useRef(1284);
  const setV = (n: number) => {
    viewersRef.current = n;
    setViewers(n);
  };

  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const msgId = useRef(0);
  const chatTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const waveRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ptsRef = useRef<number[]>([]);
  const dimRef = useRef({ W: 0, H: 0 });

  // ---------- waveform bars (client-only to avoid hydration mismatch) ----------
  useEffect(() => {
    const wave = waveRef.current;
    if (!wave) return;
    wave.innerHTML = "";
    for (let i = 0; i < 16; i++) {
      const b = document.createElement("i");
      b.style.animationDelay = (Math.random() * 0.9).toFixed(2) + "s";
      b.style.animationDuration = (0.6 + Math.random() * 0.7).toFixed(2) + "s";
      wave.appendChild(b);
    }
  }, []);

  // ---------- chart drawing ----------
  const seed = () => {
    const pts: number[] = [];
    let v = 50;
    for (let i = 0; i < 70; i++) {
      v += (Math.random() - 0.46) * 7;
      pts.push(Math.max(12, Math.min(88, v)));
    }
    ptsRef.current = pts;
  };

  const size = () => {
    const cv = canvasRef.current;
    if (!cv) return;
    const r = cv.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    dimRef.current = { W: r.width, H: r.height };
    cv.width = r.width * dpr;
    cv.height = r.height * dpr;
    const ctx = cv.getContext("2d");
    ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const draw = () => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    const { W, H } = dimRef.current;
    if (!cv || !ctx || !W) return;
    const pts = ptsRef.current;

    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = "rgba(18,17,11,.07)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 5; i++) {
      const y = (H * i) / 5;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }
    const step = W / (pts.length - 1);
    ctx.beginPath();
    ctx.moveTo(0, H);
    pts.forEach((p, i) => ctx.lineTo(i * step, H - (p / 100) * H * 0.72 - H * 0.1));
    ctx.lineTo(W, H);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "rgba(232,164,5,.34)");
    g.addColorStop(1, "rgba(232,164,5,0)");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.beginPath();
    pts.forEach((p, i) => {
      const x = i * step;
      const y = H - (p / 100) * H * 0.72 - H * 0.1;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.strokeStyle = "#E8A400";
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "round";
    ctx.stroke();
    const lx = (pts.length - 1) * step;
    const ly = H - (pts[pts.length - 1] / 100) * H * 0.72 - H * 0.1;
    ctx.beginPath();
    ctx.arc(lx, ly, 4.5, 0, 7);
    ctx.fillStyle = "#E8A400";
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lx, ly, 9, 0, 7);
    ctx.strokeStyle = "rgba(232,164,5,.35)";
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  // initial chart + resize handling + live update
  useEffect(() => {
    seed();
    size();
    draw();

    const onResize = () => {
      size();
      draw();
    };
    window.addEventListener("resize", onResize);

    let ticker: ReturnType<typeof setInterval> | null = null;
    if (!reduce) {
      ticker = setInterval(() => {
        const pts = ptsRef.current;
        pts.shift();
        const v = pts[pts.length - 1] + (Math.random() - 0.46) * 7;
        pts.push(Math.max(12, Math.min(88, v)));
        draw();
      }, 900);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (ticker) clearInterval(ticker);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  // ---------- chat ----------
  const push = (who: string, txt: string, mine = false) => {
    setMessages((prev) => {
      const next = [...prev, { id: msgId.current++, who, txt, mine }];
      while (next.length > 7) next.shift();
      return next;
    });
  };

  const runChat = () => {
    if (chatTimer.current) clearInterval(chatTimer.current);
    const list = chats[room] || chats.HOOD;
    const seedMsgs: Msg[] = [];
    for (let i = 0; i < 4; i++) {
      const m = list[i % list.length];
      seedMsgs.push({ id: msgId.current++, who: m[0], txt: m[1], mine: false });
    }
    setMessages(seedMsgs);
    if (reduce) return;
    let ci = 0;
    chatTimer.current = setInterval(() => {
      const l = chats[room] || chats.HOOD;
      const m = l[ci++ % l.length];
      push(m[0], m[1]);
    }, 2600);
  };

  // ---------- react to room selection ----------
  useEffect(() => {
    setV(coin.live ? coin.v : 1 + Math.round(Math.random() * 6));
    seed();
    draw();
    runChat();
    return () => {
      if (chatTimer.current) clearInterval(chatTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTicker, reduce]);

  // ---------- viewer count drift ----------
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => {
      let v = viewersRef.current + Math.round((Math.random() - 0.35) * 9);
      if (v < 40) v = 40;
      setV(v);
    }, 1800);
    return () => clearInterval(t);
  }, [reduce]);

  const submit = () => {
    const v = input.trim();
    if (!v) return;
    push("you", v, true);
    setInput("");
  };

  return (
    <div className="glass console" id="console">
      <div className="console-bar">
        <span className="onair">
          <i />
          ON AIR
        </span>
        <span className="room-tick">${room}</span>
        <span className="room-host">hosted by 0x4f2c…9ce1</span>
        <span className="viewers">
          <b>{viewers.toLocaleString()}</b> watching
        </span>
      </div>

      <div className="stage">
        <span className="share-label">Sharing screen — {room} / USDG</span>
        <canvas id="chartCanvas" ref={canvasRef} />
        <div className="stage-strip">
          <div className="speaker host talking">
            <span className="face" />
            host
          </div>
          <div className="speaker">
            <span className="face" />
            0x91a
          </div>
          <div className="speaker">
            <span className="face" />
            0x7db
          </div>
          <div className="speaker">
            <span className="face" />
            0xc40
          </div>
          <div className="wave" ref={waveRef} />
        </div>
      </div>

      <div className="console-body">
        <div className="chat">
          {messages.map((m) => (
            <div className="msg" key={m.id}>
              <span className="who">{m.mine ? "you" : m.who}</span>
              <span className="txt">{m.txt}</span>
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="Say something to the room"
            aria-label="Message the room"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submit();
            }}
          />
          <button className="send" aria-label="Send message" onClick={submit}>
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
      </div>
    </div>
  );
}
