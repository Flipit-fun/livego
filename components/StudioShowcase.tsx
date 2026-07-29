"use client";

import { useEffect, useRef, useState } from "react";
import { chats } from "@/lib/data";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useToast } from "./Toast";

interface Msg {
  id: number;
  who: string;
  txt: string;
  mine: boolean;
}

const ROOM = { t: "HOOD", title: "Chain roadmap, unfiltered" };

export default function StudioShowcase() {
  const reduce = useReducedMotion();
  const toast = useToast();

  const [mic, setMic] = useState(true);
  const [cam, setCam] = useState(false);
  const [sharing, setSharing] = useState(true);
  const [onAir, setOnAir] = useState(true);
  const [viewers, setViewers] = useState(1284);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");

  const msgId = useRef(0);
  const chatTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const viewTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const waveRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ptsRef = useRef<number[]>([]);
  const dimRef = useRef({ W: 0, H: 0 });
  const onAirRef = useRef(true);
  const sharingRef = useRef(true);

  onAirRef.current = onAir;
  sharingRef.current = sharing;

  // waveform bars
  useEffect(() => {
    const wave = waveRef.current;
    if (!wave) return;
    wave.innerHTML = "";
    for (let i = 0; i < 14; i++) {
      const b = document.createElement("i");
      b.style.animationDelay = (Math.random() * 0.9).toFixed(2) + "s";
      b.style.animationDuration = (0.6 + Math.random() * 0.7).toFixed(2) + "s";
      wave.appendChild(b);
    }
  }, []);

  // chart
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
    const d = Math.min(window.devicePixelRatio || 1, 2);
    dimRef.current = { W: r.width, H: r.height };
    cv.width = r.width * d;
    cv.height = r.height * d;
    cv.getContext("2d")?.setTransform(d, 0, 0, d, 0, 0);
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
    pts.forEach((p, i) => ctx.lineTo(i * step, H - (p / 100) * H * 0.66 - H * 0.14));
    ctx.lineTo(W, H);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "rgba(232,164,5,.32)");
    g.addColorStop(1, "rgba(232,164,5,0)");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.beginPath();
    pts.forEach((p, i) => {
      const x = i * step;
      const y = H - (p / 100) * H * 0.66 - H * 0.14;
      i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
    });
    ctx.strokeStyle = "#E8A400";
    ctx.lineWidth = 2.2;
    ctx.lineJoin = "round";
    ctx.stroke();
    const lx = (pts.length - 1) * step;
    const ly = H - (pts[pts.length - 1] / 100) * H * 0.66 - H * 0.14;
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

  useEffect(() => {
    seed();
    size();
    draw();
    const onResize = () => {
      size();
      draw();
    };
    window.addEventListener("resize", onResize);
    let t: ReturnType<typeof setInterval> | null = null;
    if (!reduce) {
      t = setInterval(() => {
        if (!onAirRef.current || !sharingRef.current) return;
        const pts = ptsRef.current;
        pts.shift();
        pts.push(Math.max(12, Math.min(88, pts[pts.length - 1] + (Math.random() - 0.46) * 7)));
        draw();
      }, 900);
    }
    return () => {
      window.removeEventListener("resize", onResize);
      if (t) clearInterval(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  // chat
  const push = (who: string, txt: string, mine = false) => {
    setMessages((prev) => {
      const next = [...prev, { id: msgId.current++, who, txt, mine }];
      while (next.length > 8) next.shift();
      return next;
    });
  };
  const startChat = () => {
    if (chatTimer.current) clearInterval(chatTimer.current);
    const list = chats[ROOM.t] || chats.HOOD;
    const seedMsgs: Msg[] = [];
    for (let i = 0; i < 4; i++) {
      const m = list[i % list.length];
      seedMsgs.push({ id: msgId.current++, who: m[0], txt: m[1], mine: false });
    }
    setMessages(seedMsgs);
    if (reduce) return;
    let ci = 0;
    chatTimer.current = setInterval(() => {
      const l = chats[ROOM.t] || chats.HOOD;
      const m = l[ci++ % l.length];
      push(m[0], m[1]);
    }, 2800);
  };
  const startViewers = () => {
    if (viewTimer.current) clearInterval(viewTimer.current);
    if (reduce) return;
    viewTimer.current = setInterval(() => {
      setViewers((v) => Math.max(12, v + Math.round((Math.random() - 0.35) * 9)));
    }, 1900);
  };

  useEffect(() => {
    startChat();
    startViewers();
    return () => {
      if (chatTimer.current) clearInterval(chatTimer.current);
      if (viewTimer.current) clearInterval(viewTimer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce]);

  const submit = () => {
    const v = input.trim();
    if (!v) return;
    if (!onAir) {
      toast("The stream has ended - restart it to chat");
      return;
    }
    push("you", v, true);
    setInput("");
  };

  const toggleEnd = () => {
    const next = !onAir;
    setOnAir(next);
    if (next) {
      startChat();
      startViewers();
      toast("Back on air");
    } else {
      if (chatTimer.current) clearInterval(chatTimer.current);
      if (viewTimer.current) clearInterval(viewTimer.current);
      toast("Stream ended - the room is closed");
    }
  };

  return (
    <section className="sec" id="studio">
      <div className="sec-head rv">
        <div className="eyebrow">The room, working</div>
        <h2>Everything a token call needs, in one tab.</h2>
        <p>
          This is the live studio, not a picture of one. The dev toggles mic and
          camera, puts the chart on screen, and talks to the room. Holders just
          listen and chat - no cross-talk, no seat requests.
        </p>
      </div>

      <div className="glass studio rv">
        <div className="st-main">
          <div className="st-bar">
            <span className={"onair" + (onAir ? "" : " off")}>
              <i />
              {onAir ? "ON AIR" : "OFF AIR"}
            </span>
            <span className="st-tick">${ROOM.t}</span>
            <span className="st-title">{ROOM.title}</span>
            <span className="viewers">
              <b>{viewers.toLocaleString()}</b> watching
            </span>
          </div>

          <div className="stage">
            <span className="share-label">
              {sharing ? `Sharing screen - ${ROOM.t} / USDG` : "Screen share off"}
            </span>
            <canvas
              id="chartCanvas"
              ref={canvasRef}
              style={{ opacity: sharing ? 1 : 0.12 }}
            />
            <div className={"cam-view" + (cam ? " show" : "")}>
              <div className={"cam-tile" + (cam ? "" : " cam-off")}>
                <span>{cam ? "CAMERA ON" : "CAMERA OFF"}</span>
              </div>
            </div>
            <div className="listen-strip">
              <span className="listen-pill">
                <i />
                {viewers.toLocaleString()} listening
              </span>
              <div className={"wave" + (mic ? "" : " muted")} ref={waveRef} />
            </div>
          </div>

          <div className="dock">
            <button
              className={"tgl" + (mic ? " active" : "")}
              onClick={() => {
                setMic((m) => !m);
                toast(mic ? "Microphone muted" : "Microphone on");
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round">
                <path d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
                <path d="M19 11a7 7 0 0 1-14 0M12 18v4" />
              </svg>
              {mic ? "Mic on" : "Mic muted"}
            </button>
            <button
              className={"tgl" + (cam ? " active" : "")}
              onClick={() => {
                const next = !cam;
                setCam(next);
                if (next && sharing) setSharing(false);
                toast(next ? "Camera on" : "Camera off");
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="6" width="14" height="12" rx="3" />
                <path d="M16 11l6-3v8l-6-3z" />
              </svg>
              {cam ? "Camera on" : "Camera off"}
            </button>
            <button
              className={"tgl" + (sharing ? " active" : "")}
              onClick={() => {
                const next = !sharing;
                setSharing(next);
                if (next && cam) setCam(false);
                toast(next ? "Screen is being shared" : "Screen share stopped");
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="13" rx="2" />
                <path d="M8 21h8M12 17v4" />
              </svg>
              {sharing ? "Sharing screen" : "Share screen"}
            </button>
            <button className="tgl end" onClick={toggleEnd}>
              {onAir ? "End stream" : "Restart stream"}
            </button>
          </div>
        </div>

        <div className="st-side">
          <div className="side-h">Room chat</div>
          <div className="chat">
            {messages.map((m) => (
              <div className={"msg" + (m.mine ? " mine" : "")} key={m.id}>
                <span className="who">{m.mine ? "you" : m.who}</span>
                <span className="txt">{m.txt}</span>
              </div>
            ))}
          </div>
          <div className="chat-input">
            <input
              type="text"
              placeholder="Message the room"
              aria-label="Message the room"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
            />
            <button className="send" aria-label="Send message" onClick={submit}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#221B00" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
