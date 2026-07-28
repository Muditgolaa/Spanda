"use client";

import { useEffect, useRef, useState } from "react";
import { Headphones } from "lucide-react";
import { useRoomStore } from "@/store/roomStore";
import { useAudioStore } from "@/store/audioStore";
import { emitMessage } from "@/lib/socketBus";

const SIZE = 300;
const clamp = (n: number) => Math.max(0, Math.min(100, n));

export default function UserGrid() {
  const clients = useRoomStore((s) => s.clients);
  const myClientId = useRoomStore((s) => s.myClientId);
  const masterGain = useAudioStore((s) => s.masterGain);

  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [source, setSource] = useState<{ x: number; y: number } | null>(null);
  const [vol, setVol] = useState(1);

  // Live volume meter: poll my master gain (spatial audio ramps it).
  useEffect(() => {
    const id = setInterval(() => {
      if (masterGain) setVol(masterGain.gain.value);
    }, 120);
    return () => clearInterval(id);
  }, [masterGain]);

  function place(clientX: number, clientY: number) {
    const rect = boxRef.current!.getBoundingClientRect();
    const gx = clamp(((clientX - rect.left) / rect.width) * 100);
    const gy = clamp(((clientY - rect.top) / rect.height) * 100);
    setSource({ x: gx, y: gy });
    emitMessage({ type: "SET_LISTENING_SOURCE", x: gx, y: gy });
  }
  function onDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("button")) return; // tap device = reseat
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    place(e.clientX, e.clientY);
  }
  function onMove(e: React.PointerEvent) {
    if (dragging.current) place(e.clientX, e.clientY);
  }
  function onUp() {
    dragging.current = false;
  }

  const volPct = Math.round(vol * 100);

  return (
    <div className="space-y-4">
      {/* RADAR */}
      <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
        <div
          ref={boxRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          className="relative mx-auto touch-none"
          style={{ width: SIZE, height: SIZE }}
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
            <defs>
              <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(168,85,247,0.18)" />
                <stop offset="100%" stopColor="transparent" />
              </radialGradient>
            </defs>
            <circle cx="50" cy="50" r="48" fill="url(#radarGlow)" />
            {[12, 25, 38, 48].map((r) => (
              <circle key={r} cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.4" />
            ))}
            <line x1="2" y1="50" x2="98" y2="50" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
            <line x1="50" y1="2" x2="50" y2="98" stroke="rgba(255,255,255,0.06)" strokeWidth="0.4" />
          </svg>

          {/* center */}
          <div
            className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40"
            style={{ left: SIZE / 2, top: SIZE / 2 }}
          />

          {/* listening source */}
          {source && (
            <div
              className="pointer-events-none absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white shadow-lg shadow-fuchsia-500/40"
              style={{ left: (source.x / 100) * SIZE, top: (source.y / 100) * SIZE }}
            >
              <Headphones className="h-4 w-4" />
            </div>
          )}

          {/* devices */}
          {clients.map((c) => {
            const px = ((c.x ?? 50) / 100) * SIZE;
            const py = ((c.y ?? 50) / 100) * SIZE;
            const isMe = c.clientId === myClientId;
            return (
              <button
                key={c.clientId}
                onClick={() => emitMessage({ type: "REORDER", clientId: c.clientId })}
                className="absolute -translate-x-1/2 -translate-y-1/2"
                style={{ left: px, top: py }}
                title="Move to top"
              >
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ring-2 ${
                    isMe
                      ? "bg-cyan-500/20 text-cyan-300 ring-cyan-400/60"
                      : "bg-white/10 text-neutral-200 ring-white/20"
                  }`}
                >
                  {c.username.slice(0, 2).toUpperCase()}
                </span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-center text-xs text-neutral-500">
          Drag the headphones to move the sound · tap a device to reseat
        </p>
      </div>

      {/* VOLUME METER */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="mb-2 flex items-center justify-between text-xs text-neutral-400">
          <span>Your volume</span>
          <span className="tabular-nums">{volPct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-violet-500 transition-[width] duration-150"
            style={{ width: `${volPct}%` }}
          />
        </div>
      </div>

      {/* USER LIST */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-2">
        {clients.map((c) => {
          const isMe = c.clientId === myClientId;
          return (
            <div key={c.clientId} className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-white/5">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${
                  isMe ? "bg-cyan-500/20 text-cyan-300" : "bg-white/10 text-neutral-200"
                }`}
              >
                {c.username.slice(0, 2).toUpperCase()}
              </span>
              <span className="flex-1 truncate text-sm text-neutral-200">{c.username}</span>
              {isMe && (
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-medium text-cyan-300">
                  You
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* INFO */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-xs text-neutral-400">
        <p className="mb-1 font-semibold text-neutral-300">What is this?</p>
        <p>
          Each dot is a device in the room. Drag the headphones and the server
          recomputes every device&apos;s volume by distance — so the sound appears
          to move around the room. Try the Circle / ∞ effects on the left.
        </p>
      </div>
    </div>
  );
}