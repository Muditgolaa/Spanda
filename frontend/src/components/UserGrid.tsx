"use client";

import { useRef, useState } from "react";
import { useRoomStore } from "@/store/roomStore";
import { emitMessage } from "@/lib/socketBus";

const SIZE = 320;

export default function UserGrid() {
  const clients = useRoomStore((s) => s.clients);
  const myClientId = useRoomStore((s) => s.myClientId);
  const boxRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const [source, setSource] = useState<{ x: number; y: number } | null>(null);

  function place(clientX: number, clientY: number) {
    const rect = boxRef.current!.getBoundingClientRect();
    const gx = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    const gy = Math.max(0, Math.min(100, ((clientY - rect.top) / rect.height) * 100));
    setSource({ x: gx, y: gy });
    emitMessage({ type: "SET_LISTENING_SOURCE", x: gx, y: gy });
  }

  function onPointerDown(e: React.PointerEvent) {
    if ((e.target as HTMLElement).closest("button")) return; // user clicks = reseat
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    place(e.clientX, e.clientY);
  }
  function onPointerMove(e: React.PointerEvent) {
    if (dragging.current) place(e.clientX, e.clientY);
  }
  function onPointerUp() {
    dragging.current = false;
  }

  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      <div
        ref={boxRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className="relative mx-auto touch-none rounded-full bg-muted/30"
        style={{ width: SIZE, height: SIZE }}
      >
        {/* center */}
        <div
          className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground/50"
          style={{ left: SIZE / 2, top: SIZE / 2 }}
        />

        {/* manual listening source */}
        {source && (
          <div
            className="pointer-events-none absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-[11px] shadow"
            style={{ left: (source.x / 100) * SIZE, top: (source.y / 100) * SIZE }}
          >
            🔊
          </div>
        )}

        {clients.map((c) => {
          const px = ((c.x ?? 50) / 100) * SIZE;
          const py = ((c.y ?? 50) / 100) * SIZE;
          const isMe = c.clientId === myClientId;
          return (
            <button
              key={c.clientId}
              onClick={() =>
                emitMessage({ type: "REORDER", clientId: c.clientId })
              }
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 focus:outline-none"
              style={{ left: px, top: py }}
              title="Click to reseat"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${
                  isMe
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {c.username.slice(0, 2).toUpperCase()}
              </span>
              <span className="text-xs text-muted-foreground">
                {c.username}
                {isMe ? " (you)" : ""}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        {clients.length} in room · click a user to reseat · drag empty space to
        move the sound
      </p>
    </div>
  );
}